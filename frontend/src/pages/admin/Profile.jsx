import { useEffect, useState } from 'react';
import { getMe, updateMe } from '../../api/users';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const inp = { width:'100%', padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Inter,system-ui,sans-serif', fontSize:'0.93rem', color:'var(--text)', background:'var(--surface)', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' };
const lbl = { fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.4rem' };
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [name, setName]       = useState('');
  const [pwForm, setPwForm]   = useState({ old_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getMe()
      .then((r) => { setProfile(r.data); setName(r.data.name); })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const saveName = async (e) => {
    e.preventDefault(); setError('');
    try {
      const { data } = await updateMe({ name });
      setProfile(data);
      setSuccess('Name updated.');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setError('');
    try {
      await changePassword(pwForm);
      setPwForm({ old_password: '', new_password: '' });
      setSuccess('Password updated.');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '560px' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Profile info */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {/* Avatar + meta */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
            {profile?.name?.slice(0,1).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem' }}>{profile?.name}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
            <span className="badge badge-error" style={{ marginTop: '0.3rem' }}>Admin</span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1.25rem' }} />

        <form onSubmit={saveName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={lbl}>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>Email</label>
              <input value={profile?.email || ''} disabled style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input value={profile?.phone || ''} disabled style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>
          <div>
            <button type="submit" style={{ padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', color: '#fff', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', boxShadow: '0 2px 8px var(--primary-glow)' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>
            🔒
          </div>
          <h3 style={{ fontSize: '1rem' }}>Change Password</h3>
        </div>
        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '1.25rem' }} />

        <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={lbl}>Current Password</label>
            <input type="password" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} required style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div>
            <label style={lbl}>New Password</label>
            <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required minLength={8} style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div>
            <button type="submit" style={{ padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text)', fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
