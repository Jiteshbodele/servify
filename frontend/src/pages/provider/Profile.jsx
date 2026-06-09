import { useEffect, useState } from 'react';
import { getMe, updateMe } from '../../api/users';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import { formatRating, getProfileRating } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

export default function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    getMe()
      .then((r) => {
        setProfile(r.data);
        setName(r.data.name);
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
        {profile?.provider_profile?.bio && (
          <p className="text-muted">Bio: {profile.provider_profile.bio}</p>
        )}
        {profile?.provider_profile && (
          <p className="text-muted">
            Status: {profile.provider_profile.is_approved ? 'Approved' : 'Pending approval'}
          </p>
        )}
        <form onSubmit={saveName} className="form inline-form">
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>

      <div className="card">
        <h2>Change Password</h2>
        <form onSubmit={savePassword} className="form">
          <label>
            Current
            <input
              type="password"
              value={pwForm.old_password}
              onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
              required
            />
          </label>
          <label>
            New
            <input
              type="password"
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="btn btn-outline">Update Password</button>
        </form>
      </div>
    </div>
  );
}
