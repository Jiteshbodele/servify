import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, roleHome } = useAuth();

  return (
    <div className="hero">
      <div className="container hero-content">
        <span className="hero-tag">On-demand home services</span>
        <h1>Book trusted professionals near you</h1>
        <p className="hero-sub">
          Find plumbers, electricians, and more. Providers offer services, seekers book
          with real-time availability — all powered by microservices.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to={roleHome} className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: '#4338ca', fontWeight: 800, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', border: '2px solid transparent', textDecoration: 'none' }}>
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login
              </Link>
            </>
          )}
          <Link to="/catalog" className="btn btn-ghost btn-lg">
            Browse Services
          </Link>
          <Link to="/search" className="btn btn-ghost btn-lg">
            Search Providers
          </Link>
        </div>
        <div className="hero-cards">
          <div className="feature-card">
            <h3>For Seekers</h3>
            <p>Register, add your address, browse providers, book slots, pay, and review.</p>
          </div>
          <div className="feature-card">
            <h3>For Providers</h3>
            <p>Offer catalog services, set weekly availability, manage bookings end-to-end.</p>
          </div>
          <div className="feature-card">
            <h3>For Admins</h3>
            <p>Create categories and services that providers can offer on the platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
