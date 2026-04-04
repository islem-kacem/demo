import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="navbar fixed-top w-100">
      <div className="container-fluid px-0">
        <div className="nav-logo">FilmApp</div>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>Shop</Link>
          </li>
          <li>
            {user ? (
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link>
            ) : (
              <Link to="/users" className={location.pathname === '/users' ? 'active' : ''}>Sign In</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}