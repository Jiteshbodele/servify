import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBooking, updateBookingStatus } from '../../api/booking';
import { createOrder, verifyPayment } from '../../api/payment';
import { createReview } from '../../api/reviews';
import { initiateCall } from '../../api/calls';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const STATUS_STYLE = {
  pending:     { cls: 'badge-warn',    bg: '#fef3c7', color: '#b45309' },
  confirmed:   { cls: 'badge-info',    bg: '#dbeafe', color: '#1d4ed8' },
  in_progress: { cls: 'badge-info',    bg: '#dbeafe', color: '#1d4ed8' },
  completed:   { cls: 'badge-success', bg: '#d1fae5', color: '#065f46' },
  cancelled:   { cls: 'badge-muted',   bg: '#f1f5f9', color: '#64748b' },
};

const inp = { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Inter,system-ui,sans-serif', fontSize:'0.93rem', color:'var(--text)', background:'var(--surface)', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' };
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function SeekerBookingDetail() {
  const { id } = useParams();
  const [booking, setBooking]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [callResult, setCallResult] = useState(null);
  const [review, setReview]         = useState({ rating: 5, comment: '' });

  const load = () => {
    getBooking(id).then((r) => setBooking(r.data)).catch((e) => setError(getErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const cancel = async () => {
    try { await updateBookingStatus(id, 'cancelled'); setSuccess('Booking cancelled.'); load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const pay = async () => {
    setError('');
    try {
      const { data: order } = await createOrder({ booking_id: id, amount: booking.amount_charged });
      await verifyPayment({ razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: `pay_test_${Date.now()}`, razorpay_signature: 'test_signature' });
      setSuccess(order.mock ? 'Mock payment completed. View under Payments.' : 'Payment verified!');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try { await createReview({ booking_id: id, target_type: 'provider', rating: review.rating, comment: review.comment }); setSuccess('Review submitted.'); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const call = async () => {
    try { const { data } = await initiateCall(id); setCallResult(data); setSuccess(data.message || 'Call initiated.'); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  if (loading) return <Loading />;
  if (!booking) return <p className="text-muted">Booking not found.</p>;

  const ss = STATUS_STYLE[booking.status] || STATUS_STYLE.cancelled;
  const canCancel = booking.status === 'pending';
  const canPay    = ['pending','confirmed'].includes(booking.status);
  const canReview = booking.status === 'completed';
  const canCall   = ['confirmed','in_progress'].includes(booking.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Main detail card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Booking ID</p>
            <h2 style={{ fontSize: '1.1rem' }}>#{booking.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <span className={`badge ${ss.cls}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.85rem' }}>{booking.status.replace('_',' ')}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: '📅', label: 'Date',   value: formatDate(booking.booking_date) },
            { icon: '⏰', label: 'Time',   value: booking.booking_time?.slice(0,5) },
            { icon: '💳', label: 'Amount', value: formatCurrency(booking.amount_charged) },
          ].map((item) => (
            <div key={item.label} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Notes</p>
            <p style={{ fontSize: '0.92rem' }}>{booking.notes}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {canCancel && (
            <button type="button" onClick={cancel} style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--error)', background: 'transparent', color: 'var(--error)', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              Cancel Booking
            </button>
          )}
          {canPay && (
            <button type="button" onClick={pay} style={{ padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--success),#059669)', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.4)', transition: 'all 0.15s' }}>
              💳 Pay Now
            </button>
          )}
          {canCall && (
            <button type="button" onClick={call} style={{ padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 2px 8px var(--primary-glow)', transition: 'all 0.15s' }}>
              📞 Call Provider
            </button>
          )}
        </div>

        {callResult && (
          <div style={{ marginTop: '1rem', background: 'var(--primary-soft)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', fontSize: '0.88rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{callResult.message}</p>
            <p className="text-muted text-sm">Virtual: {callResult.virtual_number}</p>
          </div>
        )}
      </div>

      {/* Review form */}
      {canReview && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--warn),#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#fff', fontWeight: 800, flexShrink: 0 }}>★</div>
            <h3 style={{ fontSize: '1rem' }}>Leave a Review</h3>
          </div>
          <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1rem' }} />
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setReview({ ...review, rating: n })}
                    style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', border: review.rating >= n ? '2px solid #f59e0b' : '1.5px solid var(--border)', background: review.rating >= n ? '#fef3c7' : 'var(--surface)', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.1s' }}>
                    ★
                  </button>
                ))}
                <span style={{ alignSelf: 'center', marginLeft: '0.5rem', fontWeight: 700, color: '#b45309', fontSize: '0.9rem' }}>{review.rating}/5</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Comment</label>
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={3} placeholder="Share your experience…" style={{ ...inp, resize: 'vertical' }} onFocus={focusOn} onBlur={blurOff} />
            </div>
            <button type="submit" style={{ padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.4)', alignSelf: 'flex-start' }}>
              Submit Review ★
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
