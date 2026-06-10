import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCategories, listServices } from '../api/catalog';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function CatalogPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices]     = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    listCategories().then((r) => setCategories(r.data)).catch((e) => setError(getErrorMessage(e)));
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>Service Catalog</h1>
        <p className="text-muted">Explore all available services offered on the platform.</p>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      {/* Category filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        <button type="button" onClick={() => setCategoryId('')}
          style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: !categoryId ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: !categoryId ? 'linear-gradient(135deg,var(--primary),var(--primary-hover))' : 'var(--surface)', color: !categoryId ? '#fff' : 'var(--muted)', fontFamily: 'Inter,system-ui,sans-serif', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: !categoryId ? '0 2px 8px var(--primary-glow)' : 'none' }}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
            style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: categoryId === c.id ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: categoryId === c.id ? 'linear-gradient(135deg,var(--primary),var(--primary-hover))' : 'var(--surface)', color: categoryId === c.id ? '#fff' : 'var(--muted)', fontFamily: 'Inter,system-ui,sans-serif', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', boxShadow: categoryId === c.id ? '0 2px 8px var(--primary-glow)' : 'none' }}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ fontWeight: 600 }}>No services found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '1.25rem' }}>
          {services.map((s) => (
            <div key={s.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.2s,box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='var(--shadow)'; }}>
              <div>
                <h3 style={{ marginBottom: '0.3rem' }}>{s.name}</h3>
                <p className="text-muted text-sm" style={{ lineHeight: 1.55 }}>{s.description}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}>{formatCurrency(s.base_price)}</span>
                <span className="badge badge-info">{s.unit}</span>
              </div>
              <Link to={`/search?service=${encodeURIComponent(s.name)}`}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 2px 8px var(--primary-glow)', transition: 'all 0.15s' }}>
                Find Providers →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
