import { useEffect, useState } from 'react';
import { listNotifications } from '../api/notifications';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/helpers';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listNotifications()
      .then((r) => setItems(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <h1>Notifications</h1>
      <Alert message={error} onClose={() => setError('')} />
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        <ul className="list">
          {items.map((n) => (
            <li key={n.id} className="card list-item">
              <strong>{n.title || n.event_type || 'Notification'}</strong>
              <p>{n.message || n.body}</p>
              <span className="text-muted text-sm">
                {formatDate(n.created_at)}
                {n.is_read === false && <span className="badge badge-new">New</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
