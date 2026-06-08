import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listBookings } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const STATUS_CLASS = {
  pending: 'badge-warn',
  confirmed: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-muted',
};

export default function SeekerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listBookings()
      .then((r) => setBookings(r.data.results || r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      {loading ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <p className="text-muted">No bookings yet. <Link to="/seeker/book">Book a service</Link></p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{formatDate(b.booking_date)}</td>
                  <td>{b.booking_time}</td>
                  <td><span className={`badge ${STATUS_CLASS[b.status] || ''}`}>{b.status}</span></td>
                  <td>{formatCurrency(b.amount_charged)}</td>
                  <td><Link to={`/seeker/bookings/${b.id}`}>Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
