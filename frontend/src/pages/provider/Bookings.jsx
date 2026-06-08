import { useEffect, useState } from 'react';
import { listBookings, updateBookingStatus } from '../../api/booking';
import { createReview } from '../../api/reviews';
import { initiateCall } from '../../api/calls';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress'],
  in_progress: ['completed'],
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewId, setReviewId] = useState('');
  const [review, setReview] = useState({ rating: 4, comment: '' });

  const load = () => {
    listBookings()
      .then((r) => setBookings(r.data.results || r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setSuccess(`Status updated to ${status}.`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const call = async (id) => {
    try {
      const { data } = await initiateCall(id);
      setSuccess(data.message || 'Call initiated.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        booking_id: reviewId,
        target_type: 'seeker',
        rating: review.rating,
        comment: review.comment,
      });
      setSuccess('Review submitted.');
      setReviewId('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <p className="text-muted">No bookings yet.</p>
      ) : (
        <div className="stack">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <h3>{formatDate(b.booking_date)} at {b.booking_time}</h3>
              <p>Status: <span className="badge">{b.status}</span> · {formatCurrency(b.amount_charged)}</p>
              <p className="text-muted">Seeker: {b.seeker_user_id?.slice(0, 8)}…</p>
              <div className="btn-row">
                {(NEXT_STATUS[b.status] || []).map((s) => (
                  <button key={s} type="button" className="btn btn-outline btn-sm" onClick={() => updateStatus(b.id, s)}>
                    Mark {s}
                  </button>
                ))}
                {['confirmed', 'in_progress'].includes(b.status) && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => call(b.id)}>
                    Call Seeker
                  </button>
                )}
                {b.status === 'completed' && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewId(b.id)}>
                    Review Seeker
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewId && (
        <div className="card">
          <h3>Review Seeker</h3>
          <form onSubmit={submitReview} className="form">
            <label>
              Rating
              <input type="number" min="1" max="5" value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })} />
            </label>
            <label>
              Comment
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={2} />
            </label>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}
