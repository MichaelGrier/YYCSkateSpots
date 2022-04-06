import { Link } from 'react-router-dom';
import Slider from '../components/Slider';
import nwImage from '../assets/jpg/nwImage.jpeg';
import neImage from '../assets/jpg/neImage.jpeg';
import swImage from '../assets/jpg/swImage.jpeg';
import seImage from '../assets/jpg/seImage.jpeg';
import dtImage from '../assets/jpg/dtImage.jpeg';

function Explore() {
  return (
    <div className='explore'>
      <header>
        <p className='pageHeader'>Explore</p>
      </header>

      <main>
        <Slider />

        <p className='exploreAreaHeading'>Areas</p>
        <div className='exploreAreas'>
          <Link to='/area/NW'>
            <img src={nwImage} alt='Northwest' className='exploreAreaImg' />
            <p className='exploreAreaName'>NW</p>
          </Link>
          <Link to='/area/NE'>
            <img src={neImage} alt='Northeast' className='exploreAreaImg' />
            <p className='exploreAreaName'>NE</p>
          </Link>
          <Link to='/area/SW'>
            <img src={swImage} alt='Southwest' className='exploreAreaImg' />
            <p className='exploreAreaName'>SW</p>
          </Link>
          <Link to='/area/SE'>
            <img src={seImage} alt='Southeast' className='exploreAreaImg' />
            <p className='exploreAreaName'>SE</p>
          </Link>
          <Link to='/area/downtown'>
            <img src={dtImage} alt='Downtown Core' className='exploreAreaImg' />
            <p className='exploreAreaName'>Downtown Core</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Explore;
