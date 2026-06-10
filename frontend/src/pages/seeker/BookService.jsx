import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listServices } from '../../api/catalog';
import { listProviderServices, getAvailableSlots, createBooking } from '../../api/booking';
import { listAddresses } from '../../api/users';
import { getReviews } from '../../api/reviews';
import { searchProviders } from '../../api/search';
import { getErrorMessage } from '../../api/client';
import { dayName, formatCurrency } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function jsDateToApiDay(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function upcomingDatesForDays(apiDays, limit = 14) {
  if (!apiDays.length) return [];
  const out = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  let guard = 0;
  while (out.length < limit && guard < 90) {
    const apiDay = jsDateToApiDay(cursor.toISOString().slice(0, 10));
    if (apiDays.includes(apiDay)) out.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return out;
}

function formatDateChip(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

const selectStyle = {
  width: '100%',
  padding: '0.7rem 2.5rem 0.7rem 1rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'Inter,system-ui,sans-serif',
  fontSize: '0.93rem',
  color: 'var(--text)',
  background: 'var(--surface)',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  transition: 'border-color 0.2s,box-shadow 0.2s',
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '0.4rem',
  display: 'block',
};

function StepBadge({ n, done }) {
  return (
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.78rem', fontWeight: 800,
      background: done
        ? 'linear-gradient(135deg,var(--primary),var(--primary-hover))'
        : 'var(--border-light)',
      color: done ? '#fff' : 'var(--muted)',
      boxShadow: done ? '0 2px 8px var(--primary-glow)' : 'none',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

function SectionCard({ step, done, title, badge, children }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <StepBadge n={step} done={done} />
        <span style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)' }}>{title}</span>
        {badge && <span className="badge badge-success" style={{ marginLeft: '0.25rem' }}>{badge}</span>}
      </div>
      <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1.1rem' }} />
      {children}
    </div>
  );
}

function focusOn(e) {
  e.target.style.borderColor = 'var(--primary)';
  e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
}
function blurOff(e) {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow = 'none';
}

export default function BookService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('service_id') || '';
  const preselectedProviderServiceId = searchParams.get('provider_service_id') || '';

  const [services, setServices]   = useState([]);
  const [providers, setProviders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [daySlots, setDaySlots]   = useState([]);
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [providerServiceId, setProviderServiceId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes]         = useState('');
  const [reviews, setReviews]     = useState([]);
  const [providerNames, setProviderNames] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);

  // auto-select from search params
  useEffect(() => {
    if (!preselectedProviderServiceId) return;
    listProviderServices()
      .then((r) => {
        const match = (r.data || []).find((p) => p.id === preselectedProviderServiceId);
        if (match) setServiceId(match.service_id);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!preselectedProviderServiceId || !providers.length || providerServiceId) return;
    const match = providers.find((p) => p.id === preselectedProviderServiceId);
    if (match) setProviderServiceId(match.id);
  }, [providers, preselectedProviderServiceId, providerServiceId]);

  const selectedProvider = providers.find((p) => p.id === providerServiceId);
  const selectedService  = services.find((s) => s.id === serviceId);
  const selectedAddress  = addresses.find((a) => a.id === addressId);

  const providerSchedule = useMemo(() => {
    if (!selectedProvider?.slots?.length) return [];
    const byDay = {};
    selectedProvider.slots.forEach((s) => {
      if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
      byDay[s.day_of_week].push(s);
    });
    return Object.keys(byDay).map(Number).sort((a, b) => a - b)
      .map((day) => ({ day, slots: byDay[day] }));
  }, [selectedProvider]);

  const availableApiDays = useMemo(() => providerSchedule.map((d) => d.day), [providerSchedule]);
  const selectableDates  = useMemo(() => upcomingDatesForDays(availableApiDays), [availableApiDays]);

  const bookableTimes = useMemo(() => {
    if (!bookingDate || !selectedProvider) return [];
    const apiDay = jsDateToApiDay(bookingDate);
    const scheduleForDay = providerSchedule.find((d) => d.day === apiDay);
    if (!scheduleForDay) return [];
    const bookedTimes = new Set(
      daySlots.filter((s) => !s.available).map((s) => s.slot_start.slice(0, 8))
    );
    const times = [];
    scheduleForDay.slots.forEach((s) => {
      const [sh, sm] = s.slot_start.split(':').map(Number);
      const [eh, em] = s.slot_end.split(':').map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      while (cur < end) {
        const hh = String(Math.floor(cur / 60)).padStart(2, '0');
        const mm = String(cur % 60).padStart(2, '0');
        const key = `${hh}:${mm}:00`;
        if (!bookedTimes.has(key)) times.push(key);
        cur += 60;
      }
    });
    return times;
  }, [daySlots, bookingDate, selectedProvider, providerSchedule]);

  useEffect(() => {
    Promise.all([listServices(), listAddresses()])
      .then(([svc, addr]) => {
        setServices(svc.data);
        setAddresses(addr.data);
        if (addr.data.length) setAddressId(addr.data[0].id);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!serviceId) { setProviders([]); setProviderNames({}); return; }
    listProviderServices(serviceId)
      .then((r) => {
        setProviders(r.data);
        const svc = services.find((s) => s.id === serviceId);
        if (svc) {
          searchProviders({ q: svc.name, page_size: 50 })
            .then((sr) => {
              const map = {};
              (sr.data?.results || []).forEach((item) => {
                if (item.id && item.provider_name) map[item.id] = item.provider_name;
              });
              setProviderNames(map);
            })
            .catch(() => {});
        }
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [serviceId, services]);

  useEffect(() => {
    setBookingDate('');
    setBookingTime('');
    setDaySlots([]);
    setReviews([]);
    setShowAllReviews(false);
    if (!providerServiceId || !selectedProvider) return;
    setReviewsLoading(true);
    getReviews(selectedProvider.provider_user_id, 'provider')
      .then((r) => setReviews(r.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [providerServiceId, selectedProvider?.provider_user_id]);

  useEffect(() => {
    setBookingTime('');
    if (!providerServiceId || !bookingDate) { setDaySlots([]); return; }
    setSlotsLoading(true);
    getAvailableSlots(providerServiceId, bookingDate)
      .then((r) => setDaySlots(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setSlotsLoading(false));
  }, [providerServiceId, bookingDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createBooking({
        provider_service_id: providerServiceId,
        address_id: addressId,
        booking_date: bookingDate,
        booking_time: bookingTime,
        notes,
      });
      setSuccess('Booking created!');
      navigate(`/seeker/bookings/${data.id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      if (providerServiceId && bookingDate) {
        getAvailableSlots(providerServiceId, bookingDate)
          .then((r) => {
            setDaySlots(r.data);
            if (msg.toLowerCase().includes('already booked')) setBookingTime('');
          })
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onProviderChange = (id) => {
    setProviderServiceId(id);
    setBookingDate('');
    setBookingTime('');
    setDaySlots([]);
  };

  const price = selectedProvider?.price_override ?? selectedService?.base_price ?? 0;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const canBook = !!(addresses.length && bookingDate && bookingTime && providerSchedule.length);

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      {addresses.length === 0 && (
        <Alert type="error" message="Add an address in your Profile before booking." />
      )}

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Book a Service</h1>
        <p className="text-muted">Complete the steps below to confirm your booking.</p>
      </div>

      <form onSubmit={handleBook}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── STEP 1 ── Service & Provider ─────────────── */}
          <SectionCard step={1} done={!!providerServiceId} title="Service & Provider">

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>🛠️ Service</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={serviceId}
                    onChange={(e) => { setServiceId(e.target.value); onProviderChange(''); }}
                    required
                    style={selectStyle}
                    onFocus={focusOn}
                    onBlur={blurOff}
                  >
                    <option value="">Select a service…</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatCurrency(s.base_price)}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)', fontSize: '0.7rem' }}>▼</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>👤 Provider</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={providerServiceId}
                    onChange={(e) => onProviderChange(e.target.value)}
                    required
                    disabled={!serviceId}
                    style={{ ...selectStyle, opacity: !serviceId ? 0.55 : 1, cursor: !serviceId ? 'not-allowed' : 'pointer' }}
                    onFocus={focusOn}
                    onBlur={blurOff}
                  >
                    <option value="">Select a provider…</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {providerNames[p.id] || `Provider ${p.provider_user_id.slice(0, 8)}…`}
                        {p.price_override ? ` — ${formatCurrency(p.price_override)}` : ''}
                        {p.experience ? ` · ${p.experience}` : ''}
                        {!p.slots?.length ? ' (no slots)' : ''}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)', fontSize: '0.7rem' }}>▼</span>
                </div>
              </div>
            </div>

            {/* Provider info panel */}
            {selectedProvider && (
              <div style={{
                marginTop: '1.25rem',
                background: 'var(--primary-soft)',
                border: '1.5px solid rgba(99,102,241,0.18)',
                borderRadius: 'var(--radius)',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.1rem',
                alignItems: 'flex-start',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.15rem',
                }}>
                  {(providerNames[selectedProvider.id] || selectedProvider.provider_user_id.slice(0, 1)).slice(0, 1).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.93rem', marginBottom: '0.2rem' }}>
                    {providerNames[selectedProvider.id] || `Provider ${selectedProvider.provider_user_id.slice(0, 8)}…`}
                  </p>
                  {selectedProvider.experience && (
                    <p className="text-sm text-muted" style={{ marginBottom: '0.4rem' }}>
                      {selectedProvider.experience}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span className="badge badge-info">{formatCurrency(price)}</span>
                    {avgRating && (
                      <span className="badge badge-warn">★ {avgRating} ({reviews.length})</span>
                    )}
                  </div>
                </div>

                {providerSchedule.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                      Weekly hours
                    </p>
                    {providerSchedule.map(({ day, slots }) => (
                      <div key={day} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.1rem' }}>
                        <span style={{ fontWeight: 600, width: '32px', color: 'var(--text)' }}>{DAY_LABELS[day]}</span>
                        <span className="text-muted">
                          {slots.map((s) => `${s.slot_start.slice(0, 5)}–${s.slot_end.slice(0, 5)}`).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {selectedProvider && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ ...labelStyle, marginBottom: '0.6rem' }}>Customer Reviews</p>
                {reviewsLoading ? (
                  <p className="text-sm text-muted">Loading reviews…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted">No reviews yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rv) => (
                      <div key={rv.id} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem 0.9rem',
                      }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: rv.comment ? '0.25rem' : 0 }}>
                          <span style={{ color: '#f59e0b' }}>
                            {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}
                          </span>
                          <span className="text-xs text-muted">{rv.rating}/5</span>
                        </div>
                        {rv.comment && <p className="text-sm" style={{ margin: 0 }}>{rv.comment}</p>}
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllReviews((v) => !v)}
                        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.82rem', padding: '0.25rem 0', textDecoration: 'underline' }}
                      >
                        {showAllReviews ? 'Show less' : `+ ${reviews.length - 3} more review${reviews.length - 3 > 1 ? 's' : ''}`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── STEP 2 ── Pick a Date ─────────────────────── */}
          <SectionCard
            step={2}
            done={!!bookingDate}
            title="Pick a Date"
            badge={bookingDate ? formatDateChip(bookingDate) : null}
          >
            {selectedProvider && providerSchedule.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {selectableDates.map((d) => {
                  const sel = bookingDate === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBookingDate(d)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: sel ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: sel
                          ? 'linear-gradient(135deg,var(--primary),var(--primary-hover))'
                          : 'var(--surface)',
                        color: sel ? '#fff' : 'var(--text)',
                        fontFamily: 'Inter,system-ui,sans-serif',
                        fontSize: '0.82rem',
                        fontWeight: sel ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.45,
                        boxShadow: sel ? '0 2px 8px var(--primary-glow)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '0.68rem', opacity: 0.8, marginBottom: '0.1rem' }}>
                        {DAY_LABELS[jsDateToApiDay(d)]}
                      </div>
                      {formatDateChip(d)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted">
                {!selectedProvider ? 'Select a provider first.' : 'This provider has no availability slots yet.'}
              </p>
            )}
          </SectionCard>

          {/* ── STEP 3 ── Pick a Time ─────────────────────── */}
          <SectionCard
            step={3}
            done={!!bookingTime}
            title="Pick a Time"
            badge={bookingTime ? bookingTime.slice(0, 5) : null}
          >
            {!bookingDate ? (
              <p className="text-sm text-muted">Select a date first.</p>
            ) : slotsLoading ? (
              <p className="text-sm text-muted">Loading available slots…</p>
            ) : bookableTimes.length === 0 ? (
              <p className="text-sm text-muted">No open slots on this day — try another date.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {bookableTimes.map((t) => {
                  const sel = bookingTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBookingTime(t)}
                      style={{
                        padding: '0.5rem 1.1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: sel ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: sel
                          ? 'linear-gradient(135deg,var(--primary),var(--primary-hover))'
                          : 'var(--surface)',
                        color: sel ? '#fff' : 'var(--text)',
                        fontFamily: 'Inter,system-ui,sans-serif',
                        fontSize: '0.9rem',
                        fontWeight: sel ? 700 : 500,
                        cursor: 'pointer',
                        boxShadow: sel ? '0 2px 8px var(--primary-glow)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.slice(0, 5)}
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* ── STEP 4 ── Address & Notes ─────────────────── */}
          <SectionCard step={4} done={!!addressId} title="Address & Notes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>📍 Service Address</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                    required
                    style={selectStyle}
                    onFocus={focusOn}
                    onBlur={blurOff}
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}: {a.street}, {a.city}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)', fontSize: '0.7rem' }}>▼</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  📝 Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions for the provider…"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'Inter,system-ui,sans-serif',
                    fontSize: '0.93rem',
                    color: 'var(--text)',
                    background: 'var(--surface)',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s,box-shadow 0.2s',
                  }}
                  onFocus={focusOn}
                  onBlur={blurOff}
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Summary / Confirm ─────────────────────────── */}
          <div className="card" style={{
            padding: '1.5rem',
            background: canBook
              ? 'linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4f46e5 100%)'
              : 'var(--surface)',
            border: canBook ? 'none' : '1px solid var(--border-light)',
            transition: 'background 0.4s',
          }}>
            {canBook ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', marginBottom: '0.4rem' }}>
                    Ready to confirm!
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span>🛠️ {selectedService?.name}</span>
                    <span>·</span>
                    <span>📅 {formatDateChip(bookingDate)}</span>
                    <span>·</span>
                    <span>⏰ {bookingTime.slice(0, 5)}</span>
                    <span>·</span>
                    <span>📍 {selectedAddress?.city}</span>
                    <span>·</span>
                    <span style={{ fontWeight: 700, color: '#a5f3fc' }}>{formatCurrency(price)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.8rem 2rem',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: '#ffffff',
                    color: '#4338ca',
                    fontFamily: 'Inter,system-ui,sans-serif',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {submitting ? 'Booking…' : '✓ Confirm Booking'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', color: 'var(--muted)',
                }}>
                  ✓
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.93rem', marginBottom: '0.15rem' }}>
                    Complete the steps above to confirm your booking
                  </p>
                  <p className="text-sm text-muted">
                    {!serviceId        ? 'Start by selecting a service.' :
                     !providerServiceId ? 'Now pick a provider.' :
                     !bookingDate       ? 'Choose an available date.' :
                     !bookingTime       ? 'Select a time slot.' :
                                         'Review your address and confirm.'}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
