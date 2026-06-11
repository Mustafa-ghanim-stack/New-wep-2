'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEntityAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function EditForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('courses');
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError(t('courses.err.noId')); return; }
    api.fetchAll().then(items => {
      const found = items.find((x: any) => x.id === id);
      if (found) setForm(found); else setError(t('courses.err.notFound'));
    });
  }, [id]);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const res = await api.update(id!, form);
    setSaving(false);
    if (res.ok) router.push('/admin/courses');
    else setError(res.error || t('err.saveFailed'));
  };

  if (!form && !error) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="container-fluid"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('courses.edit')}</h1></div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label text-xs text-muted">{t('courses.form.code')}</label><input className="form-control" value={form.code || ''} onChange={e => set('code', e.target.value)} /></div>
            <div className="col-md-8"><label className="form-label text-xs text-muted">{t('courses.form.name')}</label><input className="form-control" value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.dept')}</label><input className="form-control" value={form.department || ''} onChange={e => set('department', e.target.value)} /></div>
            <div className="col-md-3"><label className="form-label text-xs text-muted">{t('courses.form.credits')}</label><input type="number" className="form-control" value={form.credits || ''} onChange={e => set('credits', e.target.value)} /></div>
            <div className="col-md-3"><label className="form-label text-xs text-muted">{t('courses.form.level')}</label>
              <select className="form-select" value={form.level || ''} onChange={e => set('level', e.target.value)}>
                <option value="">{t('form.select')}</option>
                {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={l}>{t('courses.form.levelN')} {l}</option>)}
              </select>
            </div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.instructor')}</label><input className="form-control" value={form.instructor || ''} onChange={e => set('instructor', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.status')}</label>
              <select className="form-select" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">{t('status.active')}</option>
                <option value="inactive">{t('status.inactive')}</option>
              </select>
            </div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.fee') || 'الرسوم (IQD)'}</label><input type="number" className="form-control" value={form.fee || ''} onChange={e => set('fee', e.target.value)} placeholder="0" /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">الخصم (IQD)</label><input type="number" className="form-control" value={form.discount || ''} onChange={e => set('discount', e.target.value)} placeholder="0" /></div>
            <div className="col-12"><label className="form-label text-xs text-muted">{t('courses.form.desc')}</label><textarea className="form-control" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)}></textarea></div>
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

export default function EditCoursePage() { return <Suspense><EditForm /></Suspense>; }
