import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';

const inp = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
  fontFamily: 'Inter,system-ui,sans-serif', fontSize: '0.95rem',
  color: 'var(--text)', background: 'var(--surface)', outline: 'none',
  transition: 'border-color 0.2s,box-shadow 0.2s',
};
const lbl = {
  fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: '0.4rem',
};
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const { home } = await login(email, password);
      navigate(location.state?.from?.pathname || home, { replace: true });
    } catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 80%,#06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            ServiceHub
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '2.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.4rem' }}>Welcome back</h2>
          <p className="text-muted text-sm" style={{ marginBottom: '1.5rem' }}>Enter your credentials to continue</p>
          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} autoComplete="on" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={lbl}>📧 Email</label>
              <input style={inp} id="login-email" name="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                autoComplete="username email" required onFocus={focusOn} onBlur={blurOff} />
            </div>
            <div>
              <label style={lbl}>🔒 Password</label>
              <input style={inp} id="login-password" name="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Your password"
                autoComplete="current-password" required onFocus={focusOn} onBlur={blurOff} />
            </div>
            <button type="submit" disabled={loading}
              style={{ marginTop: '0.5rem', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px var(--primary-glow)', transition: 'all 0.2s' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>Create one</Link>
          </p>
          <p className="text-xs text-muted" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
            Admin? Use credentials from createsuperuser.
          </p>
        </div>
      </div>
    </div>
  );
}
