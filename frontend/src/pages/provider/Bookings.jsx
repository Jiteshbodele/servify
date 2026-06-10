import { useEffect, useState } from 'react';
import { listBookings, updateBookingStatus } from '../../api/booking';
import { createReview } from '../../api/reviews';
import { initiateCall } from '../../api/calls';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const STATUS_META = {
  pending:     { cls: 'badge-warn',    icon: '⏳' },
  confirmed:   { cls: 'badge-info',    icon: '✅' },
  in_progress: { cls: 'badge-info',    icon: '🔄' },
  completed:   { cls: 'badge-success', icon: '🎉' },
  cancelled:   { cls: 'badge-muted',   icon: '❌' },
};
const NEXT = { pending: ['confirmed','cancelled'], confirmed: ['in_progress'], in_progress: ['completed'] };
const NEXT_STYLE = {
  confirmed:   { bg: 'linear-gradient(135deg,var(--success),#059669)', shadow: 'rgba(16,185,129,0.35)' },
  in_progress: { bg: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', shadow: 'var(--primary-glow)' },
  completed:   { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,0.35)' },
  cancelled:   { bg: 'var(--bg-2)', shadow: 'none', color: 'var(--muted)' },
};

const inp = { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Inter,system-ui,sans-serif', fontSize:'0.93rem', color:'var(--text)', background:'var(--surface)', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' };
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [reviewId, setReviewId] = useState('');
  const [review, setReview]     = useState({ rating: 4, comment: '' });

  const load = () => {
    listBookings().then((r) => setBookings(r.data.results || r.data)).catch((e) => setError(getErrorMessage(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await updateBookingStatus(id, status); setSuccess(`Marked as ${status}.`); load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  const call = async (id) => {
    try { const { data } = await initiateCall(id); setSuccess(data.message || 'Call initiated.'); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  const submitReview = async (e) => {
    e.preventDefault();
    try { await createReview({ booking_id: reviewId, target_type: 'seeker', rating: review.rating, comment: review.comment }); setSuccess('Review submitted.'); setReviewId(''); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {loading ? <Loading /> : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ fontWeight: 600 }}>No bookings yet</p>
          <p className="text-muted text-sm">Bookings from seekers will appear here.</p>
        </div>
      ) : (
        bookings.map((b) => {
          const sm = STATUS_META[b.status] || STATUS_META.cancelled;
          const next = NEXT[b.status] || [];
          return (
            <div key={b.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {sm.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.97rem', marginBottom: '0.15rem' }}>{formatDate(b.booking_date)} at {b.booking_time?.slice(0,5)}</p>
                    <p className="text-sm text-muted">Seeker: {b.seeker_user_id?.slice(0,8)}… · {formatCurrency(b.amount_charged)}</p>
                  </div>
                </div>
                <span className={`badge ${sm.cls}`}>{b.status.replace('_',' ')}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {next.map((s) => {
                  const ns = NEXT_STYLE[s] || {};
                  return (
                    <button key={s} type="button" onClick={() => updateStatus(b.id, s)}
                      style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: ns.bg || 'var(--bg-2)', color: ns.color || '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: ns.shadow ? `0 2px 6px ${ns.shadow}` : 'none', transition: 'all 0.15s' }}>
                      Mark {s}
                    </button>
                  );
                })}
                {['confirmed','in_progress'].includes(b.status) && (
                  <button type="button" onClick={() => call(b.id)}
                    style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 2px 6px var(--primary-glow)', transition: 'all 0.15s' }}>
                    📞 Call Seeker
                  </button>
                )}
                {b.status === 'completed' && (
                  <button type="button" onClick={() => setReviewId(b.id)}
                    style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    ★ Review Seeker
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {reviewId && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>★ Review Seeker</h3>
          <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1rem' }} />
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setReview({ ...review, rating: n })}
                    style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', border: review.rating >= n ? '2px solid #f59e0b' : '1.5px solid var(--border)', background: review.rating >= n ? '#fef3c7' : 'var(--surface)', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.1s' }}>
                    ★
                  </button>
                ))}
                <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.88rem', marginLeft: '0.4rem' }}>{review.rating}/5</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>Comment</label>
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} rows={2} style={{ ...inp, resize: 'vertical' }} onFocus={focusOn} onBlur={blurOff} />
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                Submit
              </button>
              <button type="button" onClick={() => setReviewId('')} style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
