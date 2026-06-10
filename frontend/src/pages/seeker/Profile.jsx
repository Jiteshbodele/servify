import { useEffect, useState } from 'react';
import { getMe, updateMe, listAddresses, createAddress, deleteAddress } from '../../api/users';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../api/client';
import { formatRating, getProfileRating } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loading from '../../components/Loading';

const emptyAddress = { label:'Home', street:'', city:'', state:'', pincode:'', is_default:true, latitude:'', longitude:'' };

const inp = { width:'100%', padding:'0.7rem 1rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Inter,system-ui,sans-serif', fontSize:'0.93rem', color:'var(--text)', background:'var(--surface)', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s' };
const lbl = { fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.4rem' };
function focusOn(e) { e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 3px var(--primary-glow)'; }
function blurOff(e) { e.target.style.borderColor='var(--border)';   e.target.style.boxShadow='none'; }

function SectionHeader({ icon, title }) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--primary-hover))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', color:'#fff', flexShrink:0 }}>
          {icon}
        </div>
        <h3 style={{ fontSize:'1rem' }}>{title}</h3>
      </div>
      <div style={{ height:'1px', background:'var(--border-light)', marginBottom:'1.25rem' }} />
    </>
  );
}

export default function SeekerProfile() {
  const [profile, setProfile]       = useState(null);
  const [name, setName]             = useState('');
  const [addresses, setAddresses]   = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [pwForm, setPwForm]         = useState({ old_password:'', new_password:'' });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getMe(), listAddresses()])
      .then(([me, addr]) => { setProfile(me.data); setName(me.data.name); setAddresses(addr.data); })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const saveName = async (e) => {
    e.preventDefault(); setError('');
    try { const { data } = await updateMe({ name }); setProfile(data); setSuccess('Name updated.'); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const addAddress = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...addressForm, latitude: addressForm.latitude ? parseFloat(addressForm.latitude) : null, longitude: addressForm.longitude ? parseFloat(addressForm.longitude) : null };
      await createAddress(payload);
      setAddressForm(emptyAddress);
      setSuccess('Address added.');
      load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const removeAddress = async (id) => {
    try { await deleteAddress(id); setSuccess('Address deleted.'); load(); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setError('');
    try { await changePassword(pwForm); setPwForm({ old_password:'', new_password:'' }); setSuccess('Password updated.'); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  if (loading) return <Loading />;

  const rating = getProfileRating(profile);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', maxWidth:'560px' }}>
      <Alert message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* ── Profile info ──────────────────────────────── */}
      <div className="card" style={{ padding:'1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.5rem' }}>
          <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.4rem', flexShrink:0 }}>
            {profile?.name?.slice(0,1).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.15rem' }}>{profile?.name}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
            <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.3rem', flexWrap:'wrap' }}>
              <span className="badge badge-info">Seeker</span>
              {rating != null && <span className="badge badge-warn">★ {formatRating(rating)}</span>}
            </div>
          </div>
        </div>

        <div style={{ height:'1px', background:'var(--border-light)', marginBottom:'1.25rem' }} />

        <form onSubmit={saveName} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={lbl}>Display Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <label style={lbl}>Email</label>
              <input value={profile?.email || ''} disabled style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input value={profile?.phone || ''} disabled style={{ ...inp, opacity:0.6, cursor:'not-allowed' }} />
            </div>
          </div>
          <div>
            <button type="submit" style={{ padding:'0.7rem 1.5rem', borderRadius:'var(--radius-sm)', border:'none', background:'linear-gradient(135deg,var(--primary),var(--primary-hover))', color:'#fff', fontFamily:'Inter,system-ui,sans-serif', fontWeight:700, fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 2px 8px var(--primary-glow)' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ── Addresses ─────────────────────────────────── */}
      <div className="card" style={{ padding:'1.5rem' }}>
        <SectionHeader icon="📍" title="Addresses" />

        {addresses.length === 0 ? (
          <p className="text-sm text-muted" style={{ marginBottom:'1.25rem' }}>No addresses yet. Add one below.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1.25rem' }}>
            {addresses.map((a) => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:'0.85rem 1rem', flexWrap:'wrap' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:'0.92rem', marginBottom:'0.15rem' }}>{a.label}</p>
                  <p className="text-sm text-muted">{a.street}, {a.city}, {a.state} — {a.pincode}</p>
                </div>
                <button type="button" onClick={() => removeAddress(a.id)}
                  style={{ padding:'0.35rem 0.85rem', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--error)', background:'transparent', color:'var(--error)', fontFamily:'Inter,system-ui,sans-serif', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', whiteSpace:'nowrap' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ ...lbl, marginBottom:'0.85rem' }}>Add New Address</p>
        <form onSubmit={addAddress} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'0.85rem' }}>
          {[
            { key:'label',   label:'Label',   placeholder:'Home' },
            { key:'street',  label:'Street',  placeholder:'123 Main St', required:true },
            { key:'city',    label:'City',    placeholder:'Pune', required:true },
            { key:'state',   label:'State',   placeholder:'Maharashtra', required:true },
            { key:'pincode', label:'Pincode', placeholder:'411001', required:true },
            { key:'latitude',  label:'Latitude (opt)',  placeholder:'18.5204' },
            { key:'longitude', label:'Longitude (opt)', placeholder:'73.8567' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
              <label style={lbl}>{label}</label>
              <input value={addressForm[key]} onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })} placeholder={placeholder} required={required} style={inp} onFocus={focusOn} onBlur={blurOff} />
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button type="submit" style={{ width:'100%', padding:'0.7rem 1rem', borderRadius:'var(--radius-sm)', border:'none', background:'linear-gradient(135deg,var(--primary),var(--primary-hover))', color:'#fff', fontFamily:'Inter,system-ui,sans-serif', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 2px 8px var(--primary-glow)' }}>
              + Add Address
            </button>
          </div>
        </form>
      </div>

      {/* ── Change password ───────────────────────────── */}
      <div className="card" style={{ padding:'1.5rem' }}>
        <SectionHeader icon="🔒" title="Change Password" />
        <form onSubmit={savePassword} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={lbl}>Current Password</label>
            <input type="password" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password:e.target.value })} required style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div>
            <label style={lbl}>New Password</label>
            <input type="password" value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password:e.target.value })} required minLength={8} style={inp} onFocus={focusOn} onBlur={blurOff} />
          </div>
          <div>
            <button type="submit" style={{ padding:'0.7rem 1.5rem', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--border)', background:'transparent', color:'var(--text)', fontFamily:'Inter,system-ui,sans-serif', fontWeight:700, fontSize:'0.92rem', cursor:'pointer', transition:'all 0.15s' }}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
