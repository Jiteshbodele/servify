import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="dashboard-grid">
      <div className="card">
        <h2>Catalog Management</h2>
        <p className="text-muted">Create categories and services for providers to offer.</p>
        <div className="btn-row">
          <Link to="/admin/categories" className="btn btn-primary">Categories</Link>
          <Link to="/admin/services" className="btn btn-outline">Services</Link>
        </div>
      </div>
    </div>
  );
}
