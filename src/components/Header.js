import headerLogo from '../images/logo-white.svg';

function Header() {
  return (
    <header className="header">
      <img src={headerLogo} alt="Логотип сайта" className="header__logo" />
    </header>
  );
}

export default Header;
