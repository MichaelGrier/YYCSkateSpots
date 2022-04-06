import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email was sent');
    } catch (error) {
      toast.error('Could not send password reset email');
    }
  };

  return (
    <div className='pageContainer'>
      <header>
        <p className='pageHeader'>Forgot Password</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            value={email}
            onChange={onChange}
          />

          <div style={{ margin: '1.25rem 0 3rem 0' }}>
            <button className='forgotPasswordButton'>
              <p className='forgotPasswordText'>Send Reset Email</p>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
            </button>
          </div>

          <Link
            className='forgotPasswordLink'
            to='/sign-in'
            style={{ marginTop: '2rem' }}
          >
            Sign In
          </Link>
        </form>
      </main>
    </div>
  );
}

export default ForgotPassword;
