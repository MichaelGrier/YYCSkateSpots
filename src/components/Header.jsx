import logo from '../assets/png/logo.png';

function Header() {
  return (
    <header className='header'>
      <img src={logo} alt='logo' className='logo' />
      <h1 className='headerTitle'>yyc skate spots</h1>
    </header>
  );
}

export default Header;
