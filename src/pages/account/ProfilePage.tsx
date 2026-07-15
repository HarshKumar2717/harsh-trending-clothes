import { useState } from 'react';
import { Camera, Save, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui';

export function ProfilePage() {
  const { profile, updateProfile, updatePassword, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: name, phone });
      toast('Profile updated');
    } catch (err: any) { toast(err.message || 'Update failed', 'error'); }
    finally { setSavingProfile(false); }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { error: ue } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (ue) throw ue;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateProfile({ avatar_url: data.publicUrl });
      await refreshProfile();
      toast('Photo updated');
    } catch (err: any) { toast(err.message || 'Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast('Passwords do not match', 'error'); return; }
    if (newPwd.length < 6) { toast('Min 6 characters', 'error'); return; }
    setSavingPwd(true);
    try { await updatePassword(newPwd); setNewPwd(''); setConfirmPwd(''); toast('Password changed'); }
    catch (err: any) { toast(err.message || 'Failed', 'error'); }
    finally { setSavingPwd(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">My Profile</h1>

      {/* Avatar + basic */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-ink-900 font-display text-2xl font-bold text-gold-400">
                {(profile?.full_name?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-gold-400 text-ink-950 shadow hover:bg-gold-300">
              {uploading ? <Spinner size={14} /> : <Camera size={16} />}
              <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-ink-900">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-ink-500">{profile?.email}</p>
            <p className="mt-1 text-xs text-ink-400">Click the camera icon to upload a new photo</p>
          </div>
        </div>
      </div>

      {/* Edit details */}
      <form onSubmit={saveProfile} className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Personal Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email (read-only)</label><input className="input bg-ink-50" value={profile?.email || ''} disabled /></div>
          <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></div>
          <div><label className="label">Role</label><input className="input bg-ink-50 capitalize" value={profile?.role || ''} disabled /></div>
        </div>
        <button disabled={savingProfile} className="btn-gold mt-4">
          {savingProfile ? 'Saving…' : <><Save size={16} /> Save Changes</>}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Change Password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">New Password</label><input type="password" className="input" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="••••••••" /></div>
          <div><label className="label">Confirm Password</label><input type="password" className="input" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="••••••••" /></div>
        </div>
        <button disabled={savingPwd} className="btn-dark mt-4">
          {savingPwd ? 'Updating…' : <><Lock size={16} /> Update Password</>}
        </button>
      </form>
    </div>
  );
}
