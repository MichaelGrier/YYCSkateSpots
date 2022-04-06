import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Spot() {
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleMapsURL, setGoogleMapsURL] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchSpot = async () => {
      const docRef = doc(db, 'spots', params.spotId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // set URL for google maps link
        const location = docSnap.data().location.replace(/\s/g, '+');
        const mapsURL = `https://www.google.com/maps/place/+${location}`;
        setGoogleMapsURL(mapsURL);

        // set spot to display
        setSpot(docSnap.data());

        setLoading(false);
      }
    };

    fetchSpot();
  }, [navigate, params.spotId]);

  const onGetDirections = () => {
    window.open(googleMapsURL);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {spot.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${spot.imgUrls[index]})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
              }}
              className='swiperSlideDiv'
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt='share' />
      </div>

      {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

      <div className='spotDetails'>
        <p className='spotName'>{spot.name}</p>
        <p className='spotLocation'>{spot.location}</p>

        <ul className='spotDetailsList'>
          <li>
            <b>Obstacles:</b> {spot.obstacles.toString().replace(/,/g, ', ')}
          </li>
          <li>
            <b>Security?:</b>
            {spot.security === true ? ' True' : ' False'}
          </li>
          <li>
            <b>Best Time to Skate:</b>{' '}
            {spot.bestTimeToSkate.toString().replace(/,/g, ', ')}
          </li>
          <li>
            <b>Notes:</b> {spot.notes}
          </li>
        </ul>

        <p className='spotLocationTitle'>Location</p>

        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[spot.geolocation.lat, spot.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />

            <Marker position={[spot.geolocation.lat, spot.geolocation.lng]}>
              <Popup>{spot.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* <input type="button" className='primaryButton'>
          Get Directions
        </input> */}
        <input
          type='button'
          value='Get Directions'
          className='primaryButton'
          onClick={onGetDirections}
        />
      </div>
    </main>
  );
}

export default Spot;
