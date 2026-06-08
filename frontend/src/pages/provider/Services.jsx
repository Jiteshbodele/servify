import { useEffect, useState } from 'react';
import { listServices } from '../../api/catalog';
import { listMyProviderServices, createProviderService } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, getServiceName } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function ProviderServices() {
  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ service_id: '', price_override: '', experience: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    Promise.all([listServices(), listMyProviderServices()])
      .then(([cat, m]) => {
        setCatalog(cat.data);
        setMine(m.data);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const offer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        service_id: form.service_id,
        experience: form.experience,
      };
      if (form.price_override) payload.price_override = parseFloat(form.price_override);
      await createProviderService(payload);
      setForm({ service_id: '', price_override: '', experience: '' });
      setSuccess('Service offered successfully.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card">
        <h2>Offer a Service</h2>
        <form onSubmit={offer} className="form">
          <label>
            Catalog service
            <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} required>
              <option value="">Select</option>
              {catalog.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.base_price)})</option>
              ))}
            </select>
          </label>
          <label>
            Price override (optional)
            <input type="number" step="0.01" value={form.price_override} onChange={(e) => setForm({ ...form, price_override: e.target.value })} />
          </label>
          <label>
            Experience
            <input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years of experience" />
          </label>
          <button type="submit" className="btn btn-primary">Offer Service</button>
        </form>
      </div>

      <div className="card">
        <h2>My Offered Services</h2>
        {mine.length === 0 ? (
          <p className="text-muted">You haven't offered any services yet.</p>
        ) : (
          <ul className="list">
            {mine.map((ps) => {
              const name = getServiceName(catalog, ps.service_id);
              return (
                <li key={ps.id} className="list-item">
                  <strong>{name || 'Unknown service'}</strong>
                  <span className="text-muted text-sm"> · ID {ps.service_id.slice(0, 8)}…</span>
                  {ps.price_override != null && (
                    <span> — {formatCurrency(ps.price_override)}</span>
                  )}
                  {ps.experience && <p className="text-muted">{ps.experience}</p>}
                  <span className="badge">{ps.is_active ? 'Active' : 'Inactive'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
