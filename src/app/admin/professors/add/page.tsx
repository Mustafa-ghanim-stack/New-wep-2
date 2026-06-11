'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityAPI, useAdminAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

export default function AddProfessorPage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const api = useEntityAPI('professors');
  const { token } = useAdminAPI();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', department: '', phone: '', position: '', type: 'full',
    address: '', dob: '', gender: '', username: '', password: '', status: 'active',
    facebook: '', twitter: '', linkedin: '', instagram: '', photo: '',
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form2 = new FormData();
    form2.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=prof_${Date.now()}`, { method: 'POST', body: form2 });
    const d = await r.json();
    if (d.url) set('photo', d.url + '?t=' + Date.now());
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError(t('professors.err.required')); return; }
    setSaving(true);
    const res = await api.add(form);
    setSaving(false);
    if (res.ok) router.push('/admin/professors');
    else setError(res.error || t('err.saveFailed'));
  };

  const tabs = [t('professors.tab.basic'), t('professors.tab.account'), t('professors.tab.social')];

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('professors.add')}</h1><p className="text-muted text-sm mb-0">{t('professors.subtitle')}</p></div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <ul className="nav nav-tabs mb-4">
        {tabs.map((label, i) => (
          <li className="nav-item" key={i}>
            <button className={`nav-link ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{label}</button>
          </li>
        ))}
      </ul>

      <div className="dashboard-card">
        <div className="dashboard-card-body">

          {tab === 0 && (
            <div className="row g-3">
              {/* Photo upload */}
              <div className="col-12">
                <label className="form-label text-xs text-muted fw-semibold">Photo</label>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px dashed #ced4da', cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => fileRef.current?.click()}>
                    <img
                      src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || '?')}&background=6366f1&color=fff&size=80`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <><span className="spinner-border spinner-border-sm me-1"></span>Uploading...</> : <><i className="bi bi-upload me-1"></i>Upload Photo</>}
                    </button>
                    {form.photo && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => set('photo', '')}>
                        <i className="bi bi-x me-1"></i>Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleUpload} />
                </div>
              </div>

              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.fullname')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.dept')}</label><input className="form-control" value={form.department} onChange={e => set('department', e.target.value)} /></div>
              <div className="col-md-6">
                <label className="form-label text-xs text-muted">{t('professors.form.position')}</label>
                <select className="form-select" value={form.position} onChange={e => set('position', e.target.value)}>
                  <option value="">{t('form.select')}</option>
                  <option value="dean">{t('professors.rank.dean')}</option>
                  <option value="vice_dean">{t('professors.rank.vice_dean')}</option>
                  <option value="head">{t('professors.rank.head')}</option>
                  <option value="exam_head">{t('professors.rank.exam_head')}</option>
                  <option value="accounts">{t('professors.rank.accounts')}</option>
                  <option value="lecturer">{t('professors.rank.lecturer')}</option>
                  <option value="dept_reporter">{t('professors.rank.dept_reporter')}</option>
                </select>
              </div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.type')}</label>
                <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="full">{t('status.fulltime')}</option>
                  <option value="part">{t('status.parttime')}</option>
                </select>
              </div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.phone')}</label><input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.dob')}</label><input type="date" className="form-control" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.gender')}</label>
                <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">{t('form.select')}</option>
                  <option value="male">{t('status.male')}</option>
                  <option value="female">{t('status.female')}</option>
                </select>
              </div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.address')}</label><input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} /></div>
            </div>
          )}

          {tab === 1 && (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.email')} *</label><input type="email" className="form-control" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.username')}</label><input className="form-control" value={form.username} onChange={e => set('username', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.password')}</label><input type="password" className="form-control" value={form.password} onChange={e => set('password', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('professors.form.status')}</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">{t('status.active')}</option>
                  <option value="inactive">{t('status.inactive')}</option>
                </select>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label text-xs text-muted"><i className="bi bi-facebook me-1"></i>Facebook</label><input className="form-control" type="url" value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://..." /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted"><i className="bi bi-twitter-x me-1"></i>Twitter/X</label><input className="form-control" type="url" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://..." /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted"><i className="bi bi-linkedin me-1"></i>LinkedIn</label><input className="form-control" type="url" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://..." /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted"><i className="bi bi-instagram me-1"></i>Instagram</label><input className="form-control" type="url" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://..." /></div>
            </div>
          )}

          <div className="mt-4 d-flex gap-2">
            {tab > 0 && <button className="btn btn-outline-secondary" onClick={() => setTab(v => v - 1)}>{t('form.prev')}</button>}
            {tab < 2 && <button className="btn btn-primary" onClick={() => setTab(v => v + 1)}>{t('form.next')}</button>}
            {tab === 2 && (
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
