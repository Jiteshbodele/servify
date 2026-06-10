import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🔍', title: 'For Seekers',   desc: 'Register, add your address, browse providers, book slots, pay securely, and leave reviews.',  color: '#6366f1' },
  { icon: '🛠️', title: 'For Providers', desc: 'Offer catalog services, set weekly availability, manage bookings from start to finish.',         color: '#06b6d4' },
  { icon: '⚙️', title: 'For Admins',    desc: 'Create categories and services that providers can offer on the platform.',                        color: '#f59e0b' },
];

const stats = [
  { value: '500+', label: 'Verified Providers' },
  { value: '10k+', label: 'Bookings Completed' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '15+',  label: 'Service Categories' },
];

export default function Home() {
  const { user, roleHome } = useAuth();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4f46e5 70%,#06b6d4 100%)',
        color: '#fff', padding: '5rem 0 6rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 20% 60%,rgba(99,102,241,0.35) 0%,transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%,rgba(6,182,212,0.25) 0%,transparent 70%)' }} />
        <div className="container" style={{ position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            ✨ On-demand home services
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', maxWidth: '700px', marginBottom: '1.25rem', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.2)', lineHeight: 1.15 }}>
            Book trusted<br />professionals near you
          </h1>
          <p style={{ maxWidth: '560px', opacity: 0.88, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.25rem' }}>
            Find plumbers, electricians, and more. Real-time availability, secure payments, verified reviews — all in one place.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '4rem' }}>
            {user ? (
              <Link to={roleHome} style={{ padding: '0.85rem 2rem', borderRadius: '10px', background: '#fff', color: '#4338ca', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" style={{ padding: '0.85rem 2rem', borderRadius: '10px', background: '#fff', color: '#4338ca', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.22)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'transform 0.15s,box-shadow 0.15s' }}>
                  Get Started →
                </Link>
                <Link to="/login" style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  Sign In
                </Link>
              </>
            )}
            <Link to="/search" style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.88)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              🔍 Search Providers
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Built for everyone</h2>
            <p className="text-muted">One platform, three roles — seamlessly connected.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ padding: '1.75rem', transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'default' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='var(--shadow)'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  {f.icon}
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: f.color }}>{f.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.92rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section style={{ background: 'var(--surface)', padding: '4rem 0', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>How it works</h2>
            <p className="text-muted">Book a service in 4 simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem' }}>
            {[
              { n:'1', icon:'🔍', t:'Search',   d:'Browse providers by service, city, or rating.' },
              { n:'2', icon:'📅', t:'Book',     d:'Pick a date and time slot that works for you.' },
              { n:'3', icon:'💳', t:'Pay',      d:'Secure payment via Razorpay, any time.' },
              { n:'4', icon:'⭐', t:'Review',   d:'Rate your provider and help others decide.' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', margin: '0 auto 1rem', boxShadow: '0 4px 14px var(--primary-glow)' }}>
                  {s.icon}
                </div>
                <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem' }}>{s.t}</h3>
                <p className="text-muted text-sm">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      {!user && (
        <section style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', padding: '3.5rem 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ color: '#fff', marginBottom: '0.75rem', fontSize: 'clamp(1.4rem,3vw,2rem)' }}>Ready to get started?</h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '1.75rem', fontSize: '1.05rem' }}>Join thousands of seekers and providers on ServiceHub</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '0.85rem 2rem', borderRadius: '10px', background: '#fff', color: '#4338ca', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                Create Account
              </Link>
              <Link to="/catalog" style={{ padding: '0.85rem 1.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
                Browse Services
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
