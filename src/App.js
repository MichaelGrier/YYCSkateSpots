import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Area from './pages/Area';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import CreateSpot from './pages/CreateSpot';
import EditSpot from './pages/EditSpot';
import Spot from './pages/Spot';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/area/:areaName' element={<Area />} />
          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
          </Route>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/create-spot' element={<CreateSpot />} />
          <Route path='/edit-spot/:spotId' element={<EditSpot />} />
          <Route path='/area/:areaName/:spotId' element={<Spot />} />
        </Routes>

        <Navbar />
      </Router>

      <ToastContainer />
    </>
  );
}

export default App;
