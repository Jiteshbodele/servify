import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listServices } from '../../api/catalog';
import { listProviderServices, getAvailableSlots, createBooking } from '../../api/booking';
import { listAddresses } from '../../api/users';
import { getErrorMessage } from '../../api/client';
import { dayName, formatCurrency } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** JS Date.getDay() → API day_of_week (0=Monday). */
function jsDateToApiDay(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

/** Next upcoming calendar dates that fall on the given API weekdays. */
function upcomingDatesForDays(apiDays, limit = 12) {
  if (!apiDays.length) return [];
  const out = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  let guard = 0;
  while (out.length < limit && guard < 90) {
    const apiDay = jsDateToApiDay(cursor.toISOString().slice(0, 10));
    if (apiDays.includes(apiDay)) {
      out.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return out;
}

function formatDateChip(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BookService() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [daySlots, setDaySlots] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [providerServiceId, setProviderServiceId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedProvider = providers.find((p) => p.id === providerServiceId);

  const providerSchedule = useMemo(() => {
    if (!selectedProvider?.slots?.length) return [];
    const byDay = {};
    selectedProvider.slots.forEach((s) => {
      if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
      byDay[s.day_of_week].push(s);
    });
    return Object.keys(byDay)
      .map(Number)
      .sort((a, b) => a - b)
      .map((day) => ({
        day,
        slots: byDay[day],
      }));
  }, [selectedProvider]);

  const availableApiDays = useMemo(
    () => providerSchedule.map((d) => d.day),
    [providerSchedule]
  );

  const selectableDates = useMemo(
    () => upcomingDatesForDays(availableApiDays),
    [availableApiDays]
  );

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
    if (!serviceId) {
      setProviders([]);
      return;
    }
    listProviderServices(serviceId)
      .then((r) => setProviders(r.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, [serviceId]);

  useEffect(() => {
    setBookingDate('');
    setBookingTime('');
    setDaySlots([]);
  }, [providerServiceId]);

  useEffect(() => {
    setBookingTime('');
    if (!providerServiceId || !bookingDate) {
      setDaySlots([]);
      return;
    }
    setSlotsLoading(true);
    getAvailableSlots(providerServiceId, bookingDate)
      .then((r) => setDaySlots(r.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setSlotsLoading(false));
  }, [providerServiceId, bookingDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
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
            if (msg.toLowerCase().includes('already booked')) {
              setBookingTime('');
            }
          })
          .catch(() => {});
      }
    }
  };

  const onProviderChange = (id) => {
    setProviderServiceId(id);
    setBookingDate('');
    setBookingTime('');
    setDaySlots([]);
  };

  if (loading) return <Loading />;

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {addresses.length === 0 && (
        <Alert type="error" message="Add an address in Profile before booking." />
      )}

      <form onSubmit={handleBook} className="card form">
        <h2>Book a Service</h2>

        <label>
          Service
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              onProviderChange('');
            }}
            required
          >
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatCurrency(s.base_price)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Provider
          <select
            value={providerServiceId}
            onChange={(e) => onProviderChange(e.target.value)}
            required
            disabled={!serviceId}
          >
            <option value="">Select provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                Provider {p.provider_user_id.slice(0, 8)}…
                {p.price_override ? ` — ${formatCurrency(p.price_override)}` : ''}
                {p.experience ? ` (${p.experience})` : ''}
                {!p.slots?.length ? ' — no slots set' : ''}
              </option>
            ))}
          </select>
        </label>

        {selectedProvider && (
          <div className="card" style={{ padding: '1rem', background: 'var(--bg)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Provider weekly availability</h3>
            {providerSchedule.length === 0 ? (
              <p className="text-muted">
                This provider has not added any time slots yet. Choose another provider.
              </p>
            ) : (
              <ul className="list" style={{ marginBottom: 0 }}>
                {providerSchedule.map(({ day, slots }) => (
                  <li key={day} className="list-item" style={{ border: 'none', padding: '0.25rem 0' }}>
                    <strong>{dayName(day)}</strong>
                    <span className="text-muted" style={{ marginLeft: '0.5rem' }}>
                      {slots.map((s) => `${s.slot_start.slice(0, 5)} – ${s.slot_end.slice(0, 5)}`).join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label>
          Address
          <select value={addressId} onChange={(e) => setAddressId(e.target.value)} required>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.city}
              </option>
            ))}
          </select>
        </label>

        {selectedProvider && providerSchedule.length > 0 && (
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
              Pick an available day (only days this provider works are shown):
            </p>
            <div className="slot-grid">
              {selectableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`slot-btn ${bookingDate === d ? 'active' : ''}`}
                  onClick={() => setBookingDate(d)}
                  title={`${dayName(jsDateToApiDay(d))} — ${d}`}
                >
                  <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8 }}>
                    {DAY_LABELS[jsDateToApiDay(d)]}
                  </span>
                  {formatDateChip(d)}
                </button>
              ))}
            </div>
          </div>
        )}

        {bookingDate && (
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
              Available times on {formatDateChip(bookingDate)}:
            </p>
            {slotsLoading ? (
              <p className="text-muted">Loading slots…</p>
            ) : bookableTimes.length === 0 ? (
              <p className="text-muted">
                No open times on this day — try another date above.
              </p>
            ) : (
              <div className="slot-grid">
                {bookableTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`slot-btn ${bookingTime === t ? 'active' : ''}`}
                    onClick={() => setBookingTime(t)}
                  >
                    {t.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </label>

        {selectedProvider && (
          <p className="text-muted">
            Price: {formatCurrency(selectedProvider.price_override || 0)}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!addresses.length || !bookingDate || !bookingTime || !providerSchedule.length}
        >
          Create Booking
        </button>
      </form>
    </div>
  );
}
