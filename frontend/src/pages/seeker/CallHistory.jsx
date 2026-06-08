import { useEffect, useState } from 'react';
import { getMyCallHistory } from '../../api/calls';
import { getErrorMessage } from '../../api/client';
import { formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function SeekerCallHistory() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyCallHistory()
      .then((r) => setCalls(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      {loading ? (
        <Loading />
      ) : calls.length === 0 ? (
        <p className="text-muted">No calls yet.</p>
      ) : (
        <ul className="list">
          {calls.map((c) => (
            <li key={c.id} className="card list-item">
              <strong>{c.direction}</strong> — {c.status}
              <p>Virtual: {c.virtual_number} · {formatDate(c.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
