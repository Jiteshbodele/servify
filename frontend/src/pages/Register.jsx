import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';

const inp = {
  width: '100%', padding: '0.72rem 1rem',
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
  fontFamily: 'Inter,system-ui,sans-serif', fontSize: '0.93rem',
  color: 'var(--text)', background: 'var(--surface)', outline: 'none',
  transition: 'border-color 0.2s,box-shadow 0.2s',
};
const lbl = {
  fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '0.35rem',
};
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', name:'', phone:'', role:'seeker', password:'' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPhone = (e) => setForm({ ...form, phone: e.target.value.replace(/\D/g,'').slice(0,10) });

  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!/^\d{10}$/.test(form.phone)) { setError('Phone must be exactly 10 digits.'); return; }
    try {
      await register(form);
      setRegisteredEmail(form.email);
      setRegistered(true);
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const roleCards = [
    { value: 'seeker',   icon: '🔍', title: 'Seeker',   desc: 'Book services from providers' },
    { value: 'provider', icon: '🛠️', title: 'Provider', desc: 'Offer your skills & earn' },
  ];

  if (registered) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 80%,#06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '2rem' }}>ServiceHub</div>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem 2.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--success),#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <span style={{ fontSize: '1.75rem' }}>✓</span>
            </div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Account Created!</h2>
            <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Your account has been created successfully.
            </p>
            <p className="text-sm text-muted" style={{ marginBottom: '2rem' }}>
              Registered as <strong>{registeredEmail}</strong>. Please log in to continue.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px var(--primary-glow)' }}>
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 80%,#06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>ServiceHub</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Create your account in seconds</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem 2.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '0.2rem', fontSize: '1.35rem' }}>Get started</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>Fill in your details below</p>
          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1rem' }}>

            {/* Role picker */}
            <div>
              <label style={lbl}>I want to…</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {roleCards.map((r) => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: form.role === r.value ? '2px solid var(--primary)' : '1.5px solid var(--border)', background: form.role === r.value ? 'var(--primary-soft)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: form.role === r.value ? 'var(--primary)' : 'var(--text)' }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Full Name</label>
                <input style={inp} name="name" type="text" value={form.name} onChange={set('name')} autoComplete="name" required minLength={2} placeholder="John Doe" onFocus={focusOn} onBlur={blurOff} />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input style={inp} name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={setPhone} autoComplete="tel" required placeholder="10-digit number" onFocus={focusOn} onBlur={blurOff} />
              </div>
            </div>

            <div>
              <label style={lbl}>📧 Email</label>
              <input style={inp} name="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required placeholder="you@example.com" onFocus={focusOn} onBlur={blurOff} />
            </div>

            <div>
              <label style={lbl}>🔒 Password</label>
              <input style={inp} name="password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required minLength={8} placeholder="Min 8 characters" onFocus={focusOn} onBlur={blurOff} />
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: '0.4rem', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px var(--primary-glow)', transition: 'all 0.2s' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
