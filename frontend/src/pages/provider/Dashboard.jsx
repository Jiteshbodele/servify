import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProviderDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h2>Welcome, {user?.name}</h2>
        <p className="text-muted">Offer services and manage your bookings.</p>
        <Link to="/provider/services" className="btn btn-primary">Manage Services</Link>
      </div>
      <div className="card">
        <h3>Getting started</h3>
        <ol className="steps">
          <li>Offer a catalog service</li>
          <li>Add weekly availability slots</li>
          <li>Confirm and complete bookings</li>
        </ol>
      </div>
    </div>
  );
}
