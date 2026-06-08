import { useEffect, useState } from 'react';
import { listCategories, createCategory } from '../../api/catalog';
import { getErrorMessage } from '../../api/client';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', icon_url: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    listCategories()
      .then((r) => setCategories(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCategory(form);
      setForm({ name: '', icon_url: '' });
      setSuccess('Category created.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <form onSubmit={submit} className="card form">
        <h2>Create Category</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
        </label>
        <label>
          Icon URL
          <input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://example.com/icon.png" />
        </label>
        <button type="submit" className="btn btn-primary">Create</button>
      </form>

      <div className="card">
        <h2>All Categories</h2>
        {loading ? (
          <Loading />
        ) : categories.length === 0 ? (
          <p className="text-muted">No categories yet.</p>
        ) : (
          <ul className="list">
            {categories.map((c) => (
              <li key={c.id} className="list-item">
                <strong>{c.name}</strong>
                {c.icon_url && <span className="text-muted"> — {c.icon_url}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
