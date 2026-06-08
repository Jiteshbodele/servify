import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, roleHome } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          ServiceHub
        </Link>
        <nav className="nav-links">
          <NavLink to="/catalog">Services</NavLink>
          <NavLink to="/search">Search</NavLink>
          {user ? (
            <>
              <NavLink to={roleHome}>Dashboard</NavLink>
              <NavLink to="/notifications">Notifications</NavLink>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
              <span className="user-badge">{user.name} ({user.role})</span>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
