import { useEffect, useState } from 'react';
import { listNotifications } from '../api/notifications';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function NotificationsPage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    listNotifications().then((r) => setItems(r.data)).catch((e) => setError(getErrorMessage(e))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Notifications</h1>
        <p className="text-muted">Your latest updates and alerts.</p>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      {loading ? <Loading /> : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
          <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>No notifications yet</p>
          <p className="text-muted text-sm">You'll see booking updates and alerts here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((n) => (
            <div key={n.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                🔔
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.subject || n.title || n.event_type || 'Notification'}</p>
                  {n.is_read === false && <span className="badge badge-new">New</span>}
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: '0.35rem', lineHeight: 1.55 }}>{n.body || n.message}</p>
                <p className="text-xs text-muted">{formatDate(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
