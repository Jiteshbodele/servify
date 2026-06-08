import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Alert from '../components/Alert';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'seeker',
    password: '',
  });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: digits });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    try {
      const { home } = await register(form);
      navigate(home, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="container page-narrow">
      <div className="card auth-card">
        <h1>Register</h1>
        <p className="text-muted">Create a seeker or provider account</p>
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="form" method="post" autoComplete="on">
          <label htmlFor="register-name">
            Full Name
            <input
              id="register-name"
              name="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
          <label htmlFor="register-email">
            Email
            <input
              id="register-email"
              name="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />
          </label>
          <label htmlFor="register-phone">
            Phone
            <input
              id="register-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={setPhone}
              autoComplete="tel"
              required
              minLength={10}
              maxLength={10}
              pattern="[0-9]{10}"
              title="Enter exactly 10 digits"
              placeholder="10-digit mobile number"
            />
          </label>
          <label htmlFor="register-role">
            Role
            <select id="register-role" name="role" value={form.role} onChange={set('role')}>
              <option value="seeker">Seeker (book services)</option>
              <option value="provider">Provider (offer services)</option>
            </select>
          </label>
          <label htmlFor="register-password">
            Password
            <input
              id="register-password"
              name="password"
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
