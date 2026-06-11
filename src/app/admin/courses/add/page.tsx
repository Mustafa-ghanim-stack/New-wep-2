'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEntityAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

export default function AddCoursePage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const api = useEntityAPI('courses');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '', name: '', department: '', credits: '',
    level: '', description: '', instructor: '', status: 'active', fee: '', discount: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.code) { setError(t('courses.err.required')); return; }
    setSaving(true);
    const res = await api.add(form);
    setSaving(false);
    if (res.ok) router.push('/admin/courses');
    else setError(res.error || t('err.saveFailed'));
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('courses.add')}</h1><p className="text-muted text-sm mb-0">{t('courses.subtitle')}</p></div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label text-xs text-muted">{t('courses.form.code')}</label><input className="form-control" value={form.code} onChange={e => set('code', e.target.value)} placeholder="CS101" /></div>
            <div className="col-md-8"><label className="form-label text-xs text-muted">{t('courses.form.name')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('table.dept')}</label><input className="form-control" value={form.department} onChange={e => set('department', e.target.value)} /></div>
            <div className="col-md-3"><label className="form-label text-xs text-muted">{t('courses.form.credits')}</label><input type="number" min="1" max="6" className="form-control" value={form.credits} onChange={e => set('credits', e.target.value)} /></div>
            <div className="col-md-3"><label className="form-label text-xs text-muted">{t('courses.form.level')}</label>
              <select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}>
                <option value="">{t('form.select')}</option>
                {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={l}>{t('courses.form.levelN')} {l}</option>)}
              </select>
            </div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.instructor')}</label><input className="form-control" value={form.instructor} onChange={e => set('instructor', e.target.value)} /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.status')}</label>
              <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">{t('status.active')}</option>
                <option value="inactive">{t('status.inactive')}</option>
              </select>
            </div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">{t('courses.form.fee') || 'الرسوم (IQD)'}</label><input type="number" className="form-control" value={form.fee} onChange={e => set('fee', e.target.value)} placeholder="0" /></div>
            <div className="col-md-6"><label className="form-label text-xs text-muted">الخصم (IQD)</label><input type="number" className="form-control" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" /></div>
            <div className="col-12"><label className="form-label text-xs text-muted">{t('courses.form.desc')}</label><textarea className="form-control" rows={3} value={form.description} onChange={e => set('description', e.target.value)}></textarea></div>
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
