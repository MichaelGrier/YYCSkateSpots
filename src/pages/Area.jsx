import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import SpotItem from '../components/SpotItem';

function Area() {
  const [spots, setSpots] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        // get reference to spots collection
        const spotsRef = collection(db, 'spots');

        // create a query
        const q = query(
          spotsRef,
          where('area', '==', params.areaName),
          orderBy('timestamp', 'desc')
        );

        // execute query
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
      } catch (error) {
        toast.error('Could not fetch spots');
      }
    };

    fetchSpots();
  });

  return (
    <div className='area'>
      <header>
        <p className='pageHeader'>
          {params.areaName === 'downtown'
            ? 'Spots Downtown'
            : `Spots in ${params.areaName}`}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : spots && spots.length > 0 ? (
        <>
          <main>
            <ul className='areaSpots'>
              {spots.map((spot) => (
                <SpotItem spot={spot.data} id={spot.id} key={spot.id} />
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>No spots in {params.areaName} yet.</p>
      )}
    </div>
  );
}

export default Area;
