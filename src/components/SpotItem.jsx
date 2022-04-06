import { Link } from 'react-router-dom';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';
// import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg';

function SpotItem({ spot, id, onDelete, onEdit }) {
  return (
    <li className='areaSpot'>
      <Link to={`/area/${spot.area}/${id}`} className='areaSpotLink'>
        <img src={spot.imgUrls[0]} alt={spot.name} className='areaSpotImg' />
        <div className='areaSpotDetails'>
          <p className='areaSpotName'>{spot.name}</p>
          <p className='areaSpotLocation'>{spot.location}</p>
          <p className='areaSpotObstacles'>
            {spot.obstacles.toString().replace(/,/g, ', ')}
          </p>
        </div>
      </Link>

      {onDelete && (
        <DeleteIcon
          className='removeIcon'
          fill='rgb(231, 76, 60)'
          onClick={() => onDelete(spot.id, spot.name)}
        />
      )}

      {/* {onEdit && <EditIcon className='editIcon' onClick={() => onEdit(id)} />} */}
    </li>
  );
}

export default SpotItem;
