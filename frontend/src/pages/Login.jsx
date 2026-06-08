import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { home } = await login(email, password);
      const dest = location.state?.from?.pathname || home;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container page-narrow">
      <div className="card auth-card">
        <h1>Login</h1>
        <p className="text-muted">Sign in to your account</p>
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="form" method="post" autoComplete="on">
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Your password"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
        <p className="text-muted text-sm">
          Admin users: login with credentials created via createsuperuser.
        </p>
      </div>
    </div>
  );
}
