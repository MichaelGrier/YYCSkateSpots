import { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { db } from '../firebase.config';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SpotItem from '../components/SpotItem';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';

function Profile() {
  const auth = getAuth();
  const [spots, setSpots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFromData] = useState({
    name: auth.currentUser.displayName,
  });

  const { name } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSpots = async () => {
      const spotsRef = collection(db, 'spots');
      const q = query(
        spotsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnap = await getDocs(q);

      const spots = [];

      querySnap.forEach((doc) => {
        return spots.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setSpots(spots);
      setLoading(false);
    };

    fetchUserSpots();
  }, [auth.currentUser.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        // update display name in firebase
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // update in firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error('Unable to update user details');
    }
  };

  const onChange = (e) => {
    setFromData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (spotId) => {
    if (window.confirm('Are you sure you want to delete this spot?')) {
      // delete images from firebase storage
      const storage = getStorage();

      const imagesToDelete = spots.filter((spot) => spot.id === spotId);
      const imagesArray = imagesToDelete[0].data.imgUrls;

      imagesArray.forEach((urlToDelete) => {
        // get filename from upload URL
        let fileName = urlToDelete.split('/').pop().split('#')[0].split('?')[0];
        // replace "%2F" in URL with "/"
        fileName = fileName.replace('%2F', '/');

        const imageToDeleteRef = ref(storage, `${fileName}`);

        // delete file
        deleteObject(imageToDeleteRef).catch((error) => {
          toast.error('Failed to delete image');
        });
      });

      // delete firestore record
      await deleteDoc(doc(db, 'spots', spotId));

      // show updated state after delete
      const updatedSpots = spots.filter((spot) => spot.id !== spotId);
      setSpots(updatedSpots);
      toast.success('Spot was successfully deleted');
    }
  };

  // const onEdit = (spotId) => navigate(`/edit-spot/${spotId}`);

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'edit'}
          </p>
        </div>

        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to='/create-spot' className='createSpot'>
          <p>Add a new spot</p>
          <img src={arrowRight} alt='arrowRight' />
        </Link>

        {!loading && spots.length > 0 && (
          <>
            <p className='spotText'>Your Spots</p>
            <ul className='spotsList'>
              {spots.map((spot) => (
                <SpotItem
                  key={spot.id}
                  spot={spot.data}
                  id={spot.id}
                  onDelete={() => onDelete(spot.id)}
                  // onEdit={() => onEdit(spot.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
