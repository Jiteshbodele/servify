import { useEffect, useState } from 'react';
import { getMe, updateMe, listAddresses, createAddress, deleteAddress } from '../../api/users';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import { formatRating, getProfileRating } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const emptyAddress = {
  label: 'Home',
  street: '',
  city: '',
  state: '',
  pincode: '',
  is_default: true,
  latitude: '',
  longitude: '',
};

export default function SeekerProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getMe(), listAddresses()])
      .then(([me, addr]) => {
        setProfile(me.data);
        setName(me.data.name);
        setAddresses(addr.data);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveName = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await updateMe({ name });
      setProfile(data);
      setSuccess('Name updated.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...addressForm,
        latitude: addressForm.latitude ? parseFloat(addressForm.latitude) : null,
        longitude: addressForm.longitude ? parseFloat(addressForm.longitude) : null,
      };
      await createAddress(payload);
      setAddressForm(emptyAddress);
      setSuccess('Address added.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeAddress = async (id) => {
    try {
      await deleteAddress(id);
      setSuccess('Address deleted.');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await changePassword(pwForm);
      setPwForm({ old_password: '', new_password: '' });
      setSuccess('Password updated.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading />;

  const rating = getProfileRating(profile);

  return (
    <div className="stack">
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="card">
        <h2>Profile</h2>
        <p className="text-muted">{profile?.email} · {profile?.phone}</p>
        <p>
          <strong>Rating:</strong>{' '}
          <span className="badge">{formatRating(rating)}</span>
        </p>
        <form onSubmit={saveName} className="form inline-form">
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>

      <div className="card">
        <h2>Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-muted">Add an address before booking.</p>
        ) : (
          <ul className="list">
            {addresses.map((a) => (
              <li key={a.id} className="list-item">
                <strong>{a.label}</strong> — {a.street}, {a.city}, {a.state} {a.pincode}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeAddress(a.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addAddress} className="form form-grid">
          <label>Label<input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} /></label>
          <label>Street<input value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required /></label>
          <label>City<input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required /></label>
          <label>State<input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required /></label>
          <label>Pincode<input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} required /></label>
          <label>Latitude<input value={addressForm.latitude} onChange={(e) => setAddressForm({ ...addressForm, latitude: e.target.value })} /></label>
          <label>Longitude<input value={addressForm.longitude} onChange={(e) => setAddressForm({ ...addressForm, longitude: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">Add Address</button>
        </form>
      </div>

      <div className="card">
        <h2>Change Password</h2>
        <form onSubmit={savePassword} className="form">
          <label>Current<input type="password" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} required /></label>
          <label>New<input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required minLength={8} /></label>
          <button type="submit" className="btn btn-outline">Update Password</button>
        </form>
      </div>
    </div>
  );
}
