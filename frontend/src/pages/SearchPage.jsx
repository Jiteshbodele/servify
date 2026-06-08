import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProviders } from '../api/search';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    q: params.get('q') || params.get('service') || '',
    city: params.get('city') || '',
    category: params.get('category') || '',
    min_price: params.get('min_price') || '',
    max_price: params.get('max_price') || '',
    min_rating: params.get('min_rating') || '',
  });

  const runSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    const query = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') query[k] = v;
    });
    try {
      const { data } = await searchProviders(query);
      setResults(data.results || data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.q || form.category || form.city) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container page">
      <h1>Search Providers</h1>
      <Alert message={error} onClose={() => setError('')} />

      <form onSubmit={runSearch} className="card search-form">
        <div className="form-grid">
          <label>
            Query
            <input
              value={form.q}
              onChange={(e) => setForm({ ...form, q: e.target.value })}
              placeholder="e.g. plumbing, pipe repair"
            />
          </label>
          <label>
            City
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Pune"
            />
          </label>
          <label>
            Category
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Plumbing"
            />
          </label>
          <label>
            Min price
            <input
              type="number"
              value={form.min_price}
              onChange={(e) => setForm({ ...form, min_price: e.target.value })}
            />
          </label>
          <label>
            Max price
            <input
              type="number"
              value={form.max_price}
              onChange={(e) => setForm({ ...form, max_price: e.target.value })}
            />
          </label>
          <label>
            Min rating
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={form.min_rating}
              onChange={(e) => setForm({ ...form, min_rating: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Search
        </button>
      </form>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid-cards">
          {(Array.isArray(results) ? results : []).map((r, i) => (
            <div key={r.id || i} className="card">
              <h3>{r.service_name || r.name || 'Provider'}</h3>
              <p>{r.provider_name || r.experience || ''}</p>
              <div className="card-meta">
                {r.effective_price != null && (
                  <span className="price">{formatCurrency(r.effective_price)}</span>
                )}
                {r.avg_rating != null && (
                  <span className="badge">★ {r.avg_rating}</span>
                )}
                {r.city && <span className="badge">{r.city}</span>}
              </div>
            </div>
          ))}
          {!loading && Array.isArray(results) && results.length === 0 && (
            <p className="text-muted">No results. Try different filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
