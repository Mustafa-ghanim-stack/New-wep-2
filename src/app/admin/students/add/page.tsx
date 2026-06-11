'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

export default function AddStudentPage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const { token } = useAdminAPI();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', department: '', branch: '', password: '', photo: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form2 = new FormData();
    form2.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=student_${Date.now()}`, { method: 'POST', body: form2 });
    const d = await r.json();
    if (d.url) setForm(f => ({ ...f, photo: d.url + '?t=' + Date.now() }));
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'add', data: form }),
    });
    const d = await res.json();
    setLoading(false);
    if (res.ok) router.push('/admin/students');
    else setError(d.error || t('err.saveFailed'));
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('students.add')}</h1><p className="text-muted text-sm mb-0">{t('students.subtitle')}</p></div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          {error && <div className="alert alert-danger py-2 text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Photo upload */}
              <div className="col-12">
                <label className="form-label text-xs text-muted fw-semibold">Photo</label>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px dashed #ced4da', cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => fileRef.current?.click()}>
                    <img
                      src={form.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.fullName || '?')}&background=10b981&color=fff&size=80`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <><span className="spinner-border spinner-border-sm me-1"></span>Uploading...</> : <><i className="bi bi-upload me-1"></i>Upload Photo</>}
                    </button>
                    {form.photo && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setForm(f => ({ ...f, photo: '' }))}>
                        <i className="bi bi-x me-1"></i>Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleUpload} />
                </div>
              </div>

              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('students.form.fullname')}</label><input className="form-control" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.email')}</label><input className="form-control" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.phone')}</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.dept')}</label><input className="form-control" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('students.form.branch')}</label><input className="form-control" value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('admins.form.password')}</label><input className="form-control" required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
