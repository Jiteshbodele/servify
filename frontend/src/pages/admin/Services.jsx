import { useEffect, useState } from 'react';
import { listCategories, listServices, createService } from '../../api/catalog';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function AdminServices() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    base_price: '',
    unit: 'per visit',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    Promise.all([listCategories(), listServices()])
      .then(([cat, svc]) => {
        setCategories(cat.data);
        setServices(svc.data);
        if (cat.data.length && !form.category_id) {
          setForm((f) => ({ ...f, category_id: cat.data[0].id }));
        }
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createService({
        ...form,
        base_price: parseFloat(form.base_price),
      });
      setForm((f) => ({ ...f, name: '', description: '', base_price: '' }));
      setSuccess('Service created.');
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

      <form onSubmit={submit} className="card form">
        <h2>Create Service</h2>
        <label>
          Category
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={10} rows={3} />
        </label>
        <label>
          Base price
          <input type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} required />
        </label>
        <label>
          Unit
          <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
        </label>
        <button type="submit" className="btn btn-primary">Create</button>
      </form>

      <div className="card">
        <h2>All Services</h2>
        {services.length === 0 ? (
          <p className="text-muted">No services yet.</p>
        ) : (
          <ul className="list">
            {services.map((s) => (
              <li key={s.id} className="list-item">
                <strong>{s.name}</strong> — {formatCurrency(s.base_price)} / {s.unit}
                <p className="text-muted">{s.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
