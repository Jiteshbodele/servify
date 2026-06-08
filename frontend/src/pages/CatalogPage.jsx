import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCategories, listServices } from '../api/catalog';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories()
      .then((r) => setCategories(r.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  useEffect(() => {
    setLoading(true);
    listServices(categoryId || undefined)
      .then((r) => setServices(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="container page">
      <h1>Service Catalog</h1>
      <p className="text-muted">Browse all available services on the platform.</p>
      <Alert message={error} onClose={() => setError('')} />

      <div className="filter-bar">
        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid-cards">
          {services.length === 0 ? (
            <p className="text-muted">No services found.</p>
          ) : (
            services.map((s) => (
              <div key={s.id} className="card service-card">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="card-meta">
                  <span className="price">{formatCurrency(s.base_price)}</span>
                  <span className="badge">{s.unit}</span>
                </div>
                <Link to={`/search?service=${s.name}`} className="btn btn-outline btn-sm">
                  Find providers
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
