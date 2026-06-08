import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SeekerDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h2>Welcome, {user?.name}</h2>
        <p className="text-muted">Book home services from verified providers.</p>
        <Link to="/seeker/book" className="btn btn-primary">Book a Service</Link>
      </div>
      <div className="card">
        <h3>Quick links</h3>
        <ul className="link-list">
          <li><Link to="/seeker/bookings">View bookings</Link></li>
          <li><Link to="/seeker/profile">Manage profile & addresses</Link></li>
          <li><Link to="/catalog">Browse catalog</Link></li>
          <li><Link to="/search">Search providers</Link></li>
        </ul>
      </div>
    </div>
  );
}
