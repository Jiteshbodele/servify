import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProviders } from '../api/search';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

const FIELD_ICONS = {
  q:          '🔍',
  city:       '📍',
  category:   '🗂️',
  min_price:  '₹',
  max_price:  '₹',
  min_rating: '★',
};

const FIELD_LABELS = {
  q:          'Keyword',
  city:       'City',
  category:   'Category',
  min_price:  'Min Price',
  max_price:  'Max Price',
  min_rating: 'Min Rating',
};

const FIELD_PLACEHOLDERS = {
  q:          'e.g. plumbing, pipe repair',
  city:       'e.g. Pune, Mumbai',
  category:   'e.g. Plumbing',
  min_price:  '0',
  max_price:  '10000',
  min_rating: '1 – 5',
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [form, setForm] = useState({
    q:          params.get('q') || params.get('service') || '',
    city:       params.get('city') || '',
    category:   params.get('category') || '',
    min_price:  params.get('min_price') || '',
    max_price:  params.get('max_price') || '',
    min_rating: params.get('min_rating') || '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const clear = (k) => () => setForm((f) => ({ ...f, [k]: '' }));
  const hasFilters = Object.values(form).some((v) => v !== '');

  const runSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    const query = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== '') query[k] = v; });
    try {
      const { data } = await searchProviders(query);
      setResults(data.results || data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ q: '', city: '', category: '', min_price: '', max_price: '', min_rating: '' });
    setResults([]);
    setSearched(false);
  };

  useEffect(() => {
    if (form.q || form.category || form.city) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container page">

      {/* ── Page header ───────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.35rem' }}>Search Providers</h1>
        <p className="text-muted">Find the right professional for your needs.</p>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      {/* ── Search card ───────────────────────────── */}
      <form onSubmit={runSearch}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2rem',
        }}>

          {/* Main keyword row */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1.1rem', pointerEvents: 'none', color: 'var(--muted)',
              }}>
                🔍
              </span>
              <input
                value={form.q}
                onChange={set('q')}
                placeholder="Search for a service, e.g. plumbing, electrician…"
                style={{
                  width: '100%',
                  padding: '0.85rem 2.75rem 0.85rem 2.9rem',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '1rem',
                  color: 'var(--text)',
                  background: 'var(--surface)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {form.q && (
                <button type="button" onClick={clear('q')} style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1,
                }}>×</button>
              )}
            </div>
          </div>

          {/* Filters grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            {['city', 'category', 'min_price', 'max_price', 'min_rating'].map((key) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {FIELD_ICONS[key]} {FIELD_LABELS[key]}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={['min_price', 'max_price', 'min_rating'].includes(key) ? 'number' : 'text'}
                    min={key === 'min_rating' ? 1 : undefined}
                    max={key === 'min_rating' ? 5 : undefined}
                    step={key === 'min_rating' ? 0.1 : undefined}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={FIELD_PLACEHOLDERS[key]}
                    style={{
                      width: '100%',
                      padding: '0.6rem 2rem 0.6rem 0.75rem',
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '0.88rem',
                      color: 'var(--text)',
                      background: 'var(--surface-2)',
                      transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary)';
                      e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                      e.target.style.background = 'var(--surface)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = 'var(--surface-2)';
                    }}
                  />
                  {form[key] && (
                    <button type="button" onClick={clear(key)} style={{
                      position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--muted)', fontSize: '1rem', lineHeight: 1, padding: 0,
                    }}>×</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
              {loading ? 'Searching…' : '🔍 Search'}
            </button>
            {hasFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
                Clear all
              </button>
            )}
            {searched && !loading && (
              <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </form>

      {/* ── Results ───────────────────────────────── */}
      {loading ? (
        <Loading />
      ) : results.length > 0 ? (
        <div className="grid-cards">
          {results.map((r, i) => (
            <div key={r.id || i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ marginBottom: '0.1rem' }}>{r.service_name || r.name || 'Provider'}</h3>
              {(r.provider_name || r.experience) && (
                <p className="text-muted text-sm">{r.provider_name || r.experience}</p>
              )}
              <div className="card-meta" style={{ marginTop: 'auto' }}>
                {r.effective_price != null && (
                  <span className="price">{formatCurrency(r.effective_price)}</span>
                )}
                {r.avg_rating != null && (
                  <span className="badge badge-warn">★ {r.avg_rating}</span>
                )}
                {r.city && <span className="badge badge-info">📍 {r.city}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : searched ? (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          color: 'var(--muted)', background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>No results found</p>
          <p className="text-sm">Try different keywords, city, or adjust your filters.</p>
        </div>
      ) : null}
    </div>
  );
}
