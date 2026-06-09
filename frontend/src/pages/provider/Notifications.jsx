import { useEffect, useState } from 'react';
import { listBookings, updateBookingStatus } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const STATUS_META = {
  pending:     { label: 'New Booking Request', badgeClass: 'badge-warn',    action: 'confirm or decline' },
  confirmed:   { label: 'Booking Confirmed',   badgeClass: 'badge-info',    action: 'start when you arrive' },
  in_progress: { label: 'Job In Progress',     badgeClass: 'badge-success', action: 'mark complete when done' },
  completed:   { label: 'Job Completed',       badgeClass: 'badge-muted',   action: null },
  cancelled:   { label: 'Booking Cancelled',   badgeClass: 'badge-muted',   action: null },
};

const NEXT_STATUS = {
  pending:     ['confirmed', 'cancelled'],
  confirmed:   ['in_progress'],
  in_progress: ['completed'],
};

export default function ProviderNotifications() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    listBookings()
      .then((r) => setBookings(r.data.results || r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setSuccess(`Booking marked as ${status}.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const active = bookings.filter((b) => !['completed', 'cancelled'].includes(b.status));
  const past   = bookings.filter((b) =>  ['completed', 'cancelled'].includes(b.status));

  if (loading) return <Loading />;

  return (
    <div className="stack">
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <h2 style={{ marginBottom: 0 }}>Notifications</h2>

      {active.length === 0 && past.length === 0 && (
        <p className="text-muted">No booking activity yet.</p>
      )}

      {active.length > 0 && (
        <div className="stack">
          <p className="text-muted text-sm">Active ({active.length})</p>
          {active.map((b) => {
            const meta = STATUS_META[b.status] || {};
            const next = NEXT_STATUS[b.status] || [];
            return (
              <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong>{meta.label}</strong>
                  <span className={`badge ${meta.badgeClass}`}>{b.status}</span>
                </div>
                <p style={{ margin: '0.4rem 0' }}>
                  {formatDate(b.booking_date)} at {b.booking_time?.slice(0, 5)} · {formatCurrency(b.amount_charged)}
                </p>
                {meta.action && <p className="text-muted text-sm">→ {meta.action}</p>}
                {next.length > 0 && (
                  <div className="btn-row">
                    {next.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${s === 'cancelled' ? 'btn-ghost' : 'btn-outline'}`}
                        onClick={() => act(b.id, s)}
                      >
                        Mark {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="stack">
          <p className="text-muted text-sm">Past</p>
          {past.map((b) => {
            const meta = STATUS_META[b.status] || {};
            return (
              <div key={b.id} className="card" style={{ opacity: 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>{formatDate(b.booking_date)} at {b.booking_time?.slice(0, 5)}</span>
                  <span className={`badge ${meta.badgeClass}`}>{b.status}</span>
                </div>
                <p className="text-muted text-sm">{formatCurrency(b.amount_charged)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
