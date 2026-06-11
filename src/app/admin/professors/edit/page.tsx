'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEntityAPI, useAdminAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function EditForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('professors');
  const { token } = useAdminAPI();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api.fetchAll().then(items => {
      const found = items.find((x: any) => x.id === id);
      if (found) setForm(found); else setError(t('professors.err.notFound'));
    });
  }, [id]);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form2 = new FormData();
    form2.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=prof_${id || Date.now()}`, { method: 'POST', body: form2 });
    const d = await r.json();
    if (d.url) set('photo', d.url + '?t=' + Date.now());
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await api.update(id!, form);
    setSaving(false);
    if (res.ok) router.push('/admin/professors');
    else setError(res.error || t('err.saveFailed'));
  };

  if (!form && !error) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="container-fluid"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('professors.edit')}</h1></div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
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

            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.name')}</label><input className="form-control" value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.email')}</label><input type="email" className="form-control" value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.dept')}</label><input className="form-control" value={form.department || ''} onChange={e => set('department', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.phone')}</label><input className="form-control" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
            <div className="col-md-6">
              <label className="form-label text-xs text-muted">{t('professors.form.position')}</label>
              <select className="form-select" value={form.position || ''} onChange={e => set('position', e.target.value)}>
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
              <select className="form-select" value={form.type || 'full'} onChange={e => set('type', e.target.value)}>
                <option value="full">{t('status.fulltime')}</option>
                <option value="part">{t('status.parttime')}</option>
              </select>
            </div>
          </div>
          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
            </button>
            <button className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function EditProfessorPage() { return <Suspense><EditForm /></Suspense>; }
