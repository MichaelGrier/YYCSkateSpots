import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import Spinner from './Spinner';
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpots = async () => {
      const spotsRef = collection(db, 'spots');
      const q = query(spotsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnap = await getDocs(q);

      let spots = [];

      querySnap.forEach((doc) => {
        return spots.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setSpots(spots);
      setLoading(false);
    };

    fetchSpots();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    spots && (
      <>
        <p className='exploreHeading'>Latest</p>

        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {spots.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/area/${data.area}/${id}`)}
            >
              <div
                style={{
                  background: `url(${data.imgUrls[0]})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                }}
                className='swiperSlideDiv'
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
