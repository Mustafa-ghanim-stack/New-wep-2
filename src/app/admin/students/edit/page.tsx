'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function EditForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const id = useSearchParams().get('id');
  const { token } = useAdminAPI();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', department: '', branch: '', photo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/students?token=${token}`)
      .then(r => r.json())
      .then(d => {
        const student = d.students?.find((s: any) => String(s.id) === id);
        if (student) {
          setForm({ fullName: student.fullName, email: student.email, phone: student.phone || '', department: student.department || '', branch: student.branch || '', photo: student.photo || '' });
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form2 = new FormData();
    form2.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=student_${id || Date.now()}`, { method: 'POST', body: form2 });
    const d = await r.json();
    if (d.url) setForm(f => ({ ...f, photo: d.url + '?t=' + Date.now() }));
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id, action: 'update', data: form }),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) router.push('/admin/students');
    else setError(d.error || t('err.saveFailed'));
  };

  if (loading) return <div className="container-fluid text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (notFound) return <div className="container-fluid"><div className="text-center py-5 text-muted"><i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i><p className="mt-2">{t('students.notFound')}</p></div></div>;

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('students.edit')}</h1><p className="text-muted text-sm mb-0">{t('students.subtitle')}</p></div>
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
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditStudentPage() {
  return <Suspense><EditForm /></Suspense>;
}
