import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listTransactions } from '../../api/payment';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

function normalizeTransactions(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export default function SeekerPayments() {
  const location = useLocation();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    listTransactions()
      .then((r) => setTxns(normalizeTransactions(r.data)))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.pathname.endsWith('/payments')) {
      load();
    }
  }, [location.pathname, load]);

  return (
    <div className="stack">
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>
      <Alert message={error} onClose={() => setError('')} />
      {loading ? (
        <Loading />
      ) : txns.length === 0 ? (
        <p className="text-muted">No transactions yet. Complete a payment from a booking detail page.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td>{t.gateway_order_id || t.razorpay_order_id || '—'}</td>
                  <td>{t.booking_id ? `${t.booking_id.slice(0, 8)}…` : '—'}</td>
                  <td>{formatCurrency(t.amount)}</td>
                  <td><span className="badge">{t.status}</span></td>
                  <td>{formatDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
