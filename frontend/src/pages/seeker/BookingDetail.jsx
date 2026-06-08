import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getBooking,
  updateBookingStatus,
} from '../../api/booking';
import { createOrder, verifyPayment } from '../../api/payment';
import { createReview } from '../../api/reviews';
import { initiateCall } from '../../api/calls';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function SeekerBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [callResult, setCallResult] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = () => {
    getBooking(id)
      .then((r) => setBooking(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const cancel = async () => {
    try {
      await updateBookingStatus(id, 'cancelled');
      setSuccess('Booking cancelled.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const pay = async () => {
    setError('');
    try {
      const { data: order } = await createOrder({
        booking_id: id,
        amount: booking.amount_charged,
      });
      await verifyPayment({
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'test_signature',
      });
      setSuccess(
        order.mock
          ? 'Mock payment completed. View it under Payments.'
          : 'Payment verified. View it under Payments.'
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await createReview({
        booking_id: id,
        target_type: 'provider',
        rating: review.rating,
        comment: review.comment,
      });
      setSuccess('Review submitted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const call = async () => {
    try {
      const { data } = await initiateCall(id);
      setCallResult(data);
      setSuccess(data.message || 'Call initiated.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;
  if (!booking) return <p>Booking not found.</p>;

  const canCancel = booking.status === 'pending';
  const canPay = ['pending', 'confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed';
  const canCall = ['confirmed', 'in_progress'].includes(booking.status);

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card">
        <h2>Booking #{booking.id.slice(0, 8)}</h2>
        <dl className="detail-list">
          <dt>Date</dt><dd>{formatDate(booking.booking_date)} at {booking.booking_time}</dd>
          <dt>Status</dt><dd><span className="badge">{booking.status}</span></dd>
          <dt>Amount</dt><dd>{formatCurrency(booking.amount_charged)}</dd>
          <dt>Notes</dt><dd>{booking.notes || '—'}</dd>
        </dl>

        <div className="btn-row">
          {canCancel && (
            <button type="button" className="btn btn-outline" onClick={cancel}>Cancel Booking</button>
          )}
          {canPay && (
            <button type="button" className="btn btn-primary" onClick={pay}>Pay Now</button>
          )}
          {canCall && (
            <button type="button" className="btn btn-primary" onClick={call}>Call Provider</button>
          )}
        </div>

        {callResult && (
          <div className="call-result">
            <p>{callResult.message}</p>
            <p>Virtual: {callResult.virtual_number} · Token: {callResult.session_token}</p>
          </div>
        )}
      </div>

      {canReview && (
        <div className="card">
          <h3>Review Provider</h3>
          <form onSubmit={submitReview} className="form">
            <label>
              Rating (1–5)
              <input type="number" min="1" max="5" value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })} />
            </label>
            <label>
              Comment
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={3} />
            </label>
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        </div>
      )}
    </div>
  );
}
