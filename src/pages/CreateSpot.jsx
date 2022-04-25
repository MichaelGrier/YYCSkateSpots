/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../components/Spinner';

function CreateSpot() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    security: true,
    obstacles: [],
    bestTimeToSkate: [],
    notes: '',
    address: '',
    images: {},
  });
  const [obstaclesValue, setObstaclesValue] = useState([]);
  const [timeValue, setTimeValue] = useState([]);
  const [areaValue, setAreaValue] = useState('');

  const {
    name,
    area,
    security,
    obstacles,
    bestTimeToSkate,
    notes,
    address,
    images,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.area !== '' &&
      formData.obstacles.length !== 0 &&
      formData.bestTimeToSkate.length !== 0
    ) {
      setLoading(true);

      if (images.length > 6) {
        setLoading(false);
        toast.error('Maximum of 6 images can be uploaded');
        return;
      }

      // get geolocation data from google maps
      let geolocation = {};
      let location;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );

      const data = await response.json();

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a valid address');
        return;
      }

      // store images in firebase
      const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
          const storage = getStorage();
          const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

          const storageRef = ref(storage, 'images/' + fileName);

          const uploadTask = uploadBytesResumable(storageRef, image);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
                default:
                  break;
              }
            },
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });
      };

      const imgUrls = await Promise.all(
        [...images].map((image) => storeImage(image))
      ).catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error('Images not uploaded');
        return;
      });

      // save data to firestore
      const formDataCopy = {
        ...formData,
        imgUrls,
        geolocation,
        timestamp: serverTimestamp(),
      };

      formDataCopy.location = address;
      delete formDataCopy.images;
      delete formDataCopy.address;

      const docRef = await addDoc(collection(db, 'spots'), formDataCopy);

      setLoading(false);
      toast.success('New spot created successfully');
      navigate(`/area/${formDataCopy.area}/${docRef.id}`);
    } else {
      toast.error('All fields are required');
    }
  };

  // update formData object when text/file/boolean controls are updated
  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // text/booleans
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  // update individual state for radios and checkboxes
  const onObstacleChange = (event) => {
    if (event.target.checked) {
      setObstaclesValue([...obstaclesValue, event.target.name]);
    } else {
      setObstaclesValue(obstaclesValue.filter((v) => v !== event.target.name));
    }
  };
  const onTimeChange = (event) => {
    if (event.target.checked) {
      setTimeValue([...timeValue, event.target.name]);
    } else {
      setTimeValue(timeValue.filter((v) => v !== event.target.name));
    }
  };

  // update formData object with new radio/checkbox values
  const updateAreaState = () => {
    setFormData((prevState) => ({
      ...prevState,
      area: areaValue,
    }));
  };
  const updateObstaclesState = () => {
    setFormData((prevState) => ({
      ...prevState,
      obstacles: obstaclesValue,
    }));
  };
  const updateTimeState = () => {
    setFormData((prevState) => ({
      ...prevState,
      bestTimeToSkate: timeValue,
    }));
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Add a New Spot</p>
      </header>

      <div>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Area of the City</label>
          <div className='formRadios'>
            <label className='formRadio'>
              <input
                type='radio'
                checked={areaValue === 'downtown'}
                value='downtown'
                onChange={(e) => {
                  setAreaValue(e.target.value);
                }}
                onBlur={updateAreaState}
              />
              Downtown
            </label>

            <label className='formRadio'>
              <input
                type='radio'
                checked={areaValue === 'NW'}
                value='NW'
                onChange={(e) => {
                  setAreaValue(e.target.value);
                }}
                onBlur={updateAreaState}
              />
              NW
            </label>

            <label className='formRadio'>
              <input
                type='radio'
                value='NE'
                checked={areaValue === 'NE'}
                onChange={(e) => {
                  setAreaValue(e.target.value);
                }}
                onBlur={updateAreaState}
              />
              NE
            </label>

            <label className='formRadio'>
              <input
                type='radio'
                value='SW'
                checked={areaValue === 'SW'}
                onChange={(e) => {
                  setAreaValue(e.target.value);
                }}
                onBlur={updateAreaState}
              />
              SW
            </label>

            <label className='formRadio'>
              <input
                type='radio'
                value='SE'
                checked={areaValue === 'SE'}
                onChange={(e) => {
                  setAreaValue(e.target.value);
                }}
                onBlur={updateAreaState}
              />
              SE
            </label>
          </div>

          <label className='formLabel'>Name</label>
          <input
            type='text'
            className='formInputName'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <label className='formLabel'>Obstacles</label>
          <div className='formCheckboxes'>
            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Ledge'
                value='Ledge'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Ledge
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Stairs'
                value='Stairs'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Stairs
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Rail'
                value='Rail'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Rail
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Gap/Drop'
                value='Gap/Drop'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Gap/Drop
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Bank/Hip'
                value='Bank/Hip'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Bank/Hip
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Bump'
                value='Bump'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Bump
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Manual Pad'
                value='Manual Pad'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Manual Pad
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Flatground'
                value='Flatground'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Flatground
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Other'
                value='Other'
                onChange={onObstacleChange}
                onBlur={updateObstaclesState}
              />
              Other
            </label>
          </div>

          <label className='formLabel'>Security?</label>
          <div className='formButtons'>
            <button
              type='button'
              className={security ? 'formButtonActive' : 'formButton'}
              id='security'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type='button'
              className={
                !security && security != null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              id='security'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Best Times to Skate</label>
          <div className='formCheckboxes'>
            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Morning'
                value='Morning'
                onChange={onTimeChange}
                onBlur={updateTimeState}
              />
              Morning
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Afternoon'
                value='Afternoon'
                onChange={onTimeChange}
                onBlur={updateTimeState}
              />
              Afternoon
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Evening'
                value='Evening'
                onChange={onTimeChange}
                onBlur={updateTimeState}
              />
              Evening
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Weekends'
                value='Weekends'
                onChange={onTimeChange}
                onBlur={updateTimeState}
              />
              Weekends
            </label>

            <label className='formCheckbox'>
              <input
                type='checkbox'
                name='Anytime'
                value='Anytime'
                onChange={onTimeChange}
                onBlur={updateTimeState}
              />
              Anytime
            </label>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            name='address'
            id='address'
            value={address}
            onChange={onMutate}
            required
          ></textarea>

          <label className='formLabel'>Notes</label>
          <textarea
            className='formInputNotes'
            name='notes'
            id='notes'
            cols='36'
            rows='7'
            value={notes}
            onChange={onMutate}
          ></textarea>

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accepts='.jpg,.png,.jpeg'
            multiple
            required
          />

          <button type='submit' className='primaryButton createListingButton'>
            Add Spot
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSpot;
