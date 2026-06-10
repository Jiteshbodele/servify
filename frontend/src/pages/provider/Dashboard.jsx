import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { icon: '🛠️', title: 'Offer a service',      desc: 'Pick from the catalog and set your price.' },
  { icon: '📅', title: 'Add availability',      desc: 'Set your weekly working hours.' },
  { icon: '✅', title: 'Manage bookings',        desc: 'Confirm, start, and complete jobs.' },
];

const quickLinks = [
  { to: '/provider/services',     icon: '🛠️', label: 'My Services',    color: '#6366f1' },
  { to: '/provider/availability', icon: '📅', label: 'Availability',   color: '#06b6d4' },
  { to: '/provider/bookings',     icon: '📋', label: 'Bookings',       color: '#f59e0b' },
  { to: '/provider/calls',        icon: '📞', label: 'Call History',   color: '#10b981' },
];

export default function ProviderDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#064e3b 0%,#059669 60%,#06b6d4 100%)', borderRadius: 'var(--radius-lg)', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '0.4rem' }}>Provider Portal</p>
        <h2 style={{ color: '#fff', fontSize: 'clamp(1.3rem,3vw,1.75rem)', marginBottom: '0.6rem' }}>Hello, {user?.name} 👋</h2>
        <p style={{ opacity: 0.82, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Manage your services and grow your business.</p>
        <Link to="/provider/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-sm)', background: '#fff', color: '#065f46', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          🛠️ Manage Services
        </Link>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
        {quickLinks.map((l) => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.15s,box-shadow 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='var(--shadow)'; }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${l.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                {l.icon}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{l.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Getting started */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Getting Started</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, boxShadow: '0 2px 8px var(--primary-glow)' }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.1rem' }}>{s.title}</p>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
