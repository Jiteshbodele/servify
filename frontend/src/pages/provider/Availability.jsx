import { useEffect, useState } from 'react';
import { listServices } from '../../api/catalog';
import { listMyProviderServices, addAvailability } from '../../api/booking';
import { getErrorMessage } from '../../api/client';
import { dayName, providerServiceLabel } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export default function ProviderAvailability() {
  const [catalog, setCatalog] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    provider_service_id: '',
    day_of_week: 0,
    slot_start: '09:00:00',
    slot_end: '17:00:00',
    is_recurring: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    Promise.all([listServices(), listMyProviderServices()])
      .then(([cat, mine]) => {
        setCatalog(cat.data);
        setServices(mine.data);
        if (mine.data.length) {
          setForm((f) => ({
            ...f,
            provider_service_id: f.provider_service_id || mine.data[0].id,
          }));
        }
      });

  useEffect(() => {
    load()
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addAvailability(form);
      setSuccess('Availability slot added.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {services.length === 0 ? (
        <p className="text-muted">Offer a service first before adding availability.</p>
      ) : (
        <>
          <form onSubmit={submit} className="card form">
            <h2>Add Availability Slot</h2>
            <label>
              Provider service
              <select value={form.provider_service_id} onChange={(e) => setForm({ ...form, provider_service_id: e.target.value })} required>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {providerServiceLabel(catalog, s)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Day of week
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: +e.target.value })}>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </label>
            <label>
              Start
              <input type="time" value={form.slot_start.slice(0, 5)} onChange={(e) => setForm({ ...form, slot_start: `${e.target.value}:00` })} step="1" />
            </label>
            <label>
              End
              <input type="time" value={form.slot_end.slice(0, 5)} onChange={(e) => setForm({ ...form, slot_end: `${e.target.value}:00` })} step="1" />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} />
              Recurring weekly
            </label>
            <button type="submit" className="btn btn-primary">Add Slot</button>
          </form>

          <div className="card">
            <h2>Current Slots</h2>
            {services.map((s) => (
              <div key={s.id} className="slot-group">
                <h3>{providerServiceLabel(catalog, s)}</h3>
                {s.slots?.length ? (
                  <ul className="list">
                    {s.slots.map((slot) => (
                      <li key={slot.id} className="list-item">
                        {dayName(slot.day_of_week)}: {slot.slot_start} – {slot.slot_end}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No slots yet.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
