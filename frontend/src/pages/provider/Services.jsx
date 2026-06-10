import { useEffect, useState } from 'react';
import { listServices } from '../../api/catalog';
import { listMyProviderServices, createProviderService } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, getServiceName } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const inp = { width:'100%', padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Inter,system-ui,sans-serif', fontSize:'0.93rem', color:'var(--text)', background:'var(--surface)', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' };
const sel = { ...inp, appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.9rem center', paddingRight:'2.5rem' };
const lbl = { fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.4rem' };
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function ProviderServices() {
  const [catalog, setCatalog] = useState([]);
  const [mine, setMine]       = useState([]);
  const [form, setForm]       = useState({ service_id:'', price_override:'', experience:'' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    Promise.all([listServices(), listMyProviderServices()])
      .then(([cat, m]) => { setCatalog(cat.data); setMine(m.data); })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const offer = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { service_id: form.service_id, experience: form.experience };
      if (form.price_override) payload.price_override = parseFloat(form.price_override);
      await createProviderService(payload);
      setForm({ service_id:'', price_override:'', experience:'' });
      setSuccess('Service offered successfully.');
      load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Offer form */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
            🛠️
          </div>
          <h3 style={{ fontSize: '1rem' }}>Offer a New Service</h3>
        </div>
        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1.25rem' }} />

        <form onSubmit={offer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={lbl}>Catalog Service</label>
            <div style={{ position: 'relative' }}>
              <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })} required style={sel} onFocus={focusOn} onBlur={blurOff}>
                <option value="">Select a service…</option>
                {catalog.map((s) => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.base_price)})</option>)}
              </select>
              <span style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'var(--muted)', fontSize:'0.7rem' }}>▼</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>Price Override <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
              <input type="number" step="0.01" placeholder="Leave blank to use base price" value={form.price_override} onChange={(e) => setForm({ ...form, price_override: e.target.value })} style={inp} onFocus={focusOn} onBlur={blurOff} />
            </div>
            <div>
              <label style={lbl}>Experience</label>
              <input placeholder="e.g. 5 years in plumbing" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} style={inp} onFocus={focusOn} onBlur={blurOff} />
            </div>
          </div>
          <div>
            <button type="submit" style={{ padding:'0.7rem 1.5rem', borderRadius:'var(--radius-sm)', border:'none', background:'linear-gradient(135deg,var(--primary),var(--primary-hover))', color:'#fff', fontFamily:'Inter,system-ui,sans-serif', fontWeight:700, fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 2px 8px var(--primary-glow)', transition:'all 0.15s' }}>
              + Offer Service
            </button>
          </div>
        </form>
      </div>

      {/* My services */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>My Offered Services</h3>
        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1rem' }} />
        {mine.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛠️</div>
            <p className="text-sm">You haven't offered any services yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mine.map((ps) => {
              const name = getServiceName(catalog, ps.service_id);
              return (
                <div key={ps.id} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{name || 'Unknown service'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {ps.price_override != null && <span className="badge badge-info">{formatCurrency(ps.price_override)}</span>}
                      {ps.experience && <span className="text-sm text-muted">{ps.experience}</span>}
                    </div>
                  </div>
                  <span className={`badge ${ps.is_active ? 'badge-success' : 'badge-muted'}`}>
                    {ps.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
