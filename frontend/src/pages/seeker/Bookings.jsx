import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listBookings } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const STATUS = {
  pending:     { cls: 'badge-warn',    label: 'Pending' },
  confirmed:   { cls: 'badge-info',    label: 'Confirmed' },
  in_progress: { cls: 'badge-info',    label: 'In Progress' },
  completed:   { cls: 'badge-success', label: 'Completed' },
  cancelled:   { cls: 'badge-muted',   label: 'Cancelled' },
};

export default function SeekerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    listBookings()
      .then((r) => setBookings(r.data.results || r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Alert message={error} onClose={() => setError('')} />
      {loading ? <Loading /> : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No bookings yet</p>
          <p className="text-muted text-sm" style={{ marginBottom: '1.25rem' }}>Your booked services will appear here.</p>
          <Link to="/seeker/book" style={{ display: 'inline-flex', padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.92rem', boxShadow: '0 2px 8px var(--primary-glow)' }}>
            Book a Service
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {bookings.map((b) => {
            const s = STATUS[b.status] || { cls: 'badge-muted', label: b.status };
            return (
              <div key={b.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                    📅
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{formatDate(b.booking_date)}</p>
                    <p className="text-sm text-muted">at {b.booking_time?.slice(0,5)} · {formatCurrency(b.amount_charged)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                  <Link to={`/seeker/bookings/${b.id}`} style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 2px 6px var(--primary-glow)', whiteSpace: 'nowrap' }}>
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
