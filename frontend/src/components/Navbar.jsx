import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, roleHome } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          ServiceHub
        </Link>

        <button
          type="button"
          className={`nav-toggle${open ? ' open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links${open ? ' open' : ''}`}>
          <NavLink to="/catalog" onClick={close}>Services</NavLink>
          <NavLink to="/search" onClick={close}>Search</NavLink>
          {user ? (
            <>
              <NavLink to={roleHome} onClick={close}>Dashboard</NavLink>
              <NavLink to="/notifications" onClick={close}>Notifications</NavLink>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
              <span className="user-badge">{user.name} · {user.role}</span>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
