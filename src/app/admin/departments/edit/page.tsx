'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEntityAPI, useAdminAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function EditForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('departments');
  const { token } = useAdminAPI();
  const [form, setForm] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) { setError(t('departments.err.noId')); return; }
    api.fetchAll().then((items: any[]) => {
      const found = items.find((x: any) => x.id === id);
      if (found) setForm(found); else setError(t('departments.err.notFound'));
    });
  }, [id]);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=dept_${form.slug || id}`, { method: 'POST', body: fd });
    const d = await r.json();
    if (d.url) set('img', d.url + '?t=' + Date.now());
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.nameAr || !form.nameEn) { setError('الاسم بالعربي والإنجليزي مطلوب'); return; }
    if (!form.slug) { setError('المعرف (slug) مطلوب'); return; }
    setSaving(true);
    const res = await api.update(id!, form);
    setSaving(false);
    if (res.ok) router.push('/admin/departments');
    else setError(res.error || t('err.saveFailed'));
  };

  if (!form && !error) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error && !form) return <div className="container-fluid"><div className="alert alert-danger">{error}</div></div>;

  const tabs = ['المعلومات الأساسية', 'الرسوم الدراسية', 'معلومات القسم'];

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div><h1 className="h3 font-bold mb-1">{t('departments.edit')}</h1><p className="text-muted text-sm mb-0">{form?.nameAr}</p></div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
        </button>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <ul className="nav nav-tabs mb-3">
        {tabs.map((label, i) => (
          <li className="nav-item" key={i}>
            <button className={`nav-link ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{label}</button>
          </li>
        ))}
      </ul>

      {tab === 0 && (
        <div className="row g-3">
          {/* Image */}
          <div className="col-12">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">صورة القسم</h6></div>
              <div className="dashboard-card-body">
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 160, height: 100, borderRadius: 8, overflow: 'hidden', border: '2px dashed #ced4da', cursor: 'pointer', flexShrink: 0, background: '#f8f9fa' }}
                    onClick={() => fileRef.current?.click()}>
                    {form.img
                      ? <img src={form.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <div className="d-flex align-items-center justify-content-center h-100 text-muted"><i className="bi bi-image fs-1"></i></div>
                    }
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <><span className="spinner-border spinner-border-sm me-1"></span>Uploading...</> : <><i className="bi bi-upload me-1"></i>رفع صورة</>}
                    </button>
                    {form.img && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => set('img', '')}><i className="bi bi-x me-1"></i>إزالة</button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleUpload} />
                </div>
              </div>
            </div>
          </div>

          {/* Identifiers */}
          <div className="col-12">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">المعرفات</h6></div>
              <div className="dashboard-card-body">
                <div className="row g-3">
                  <div className="col-md-4"><label className="form-label text-xs text-muted">المعرف (slug) *</label><input className="form-control" value={form.slug || ''} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} /></div>
                  <div className="col-md-4"><label className="form-label text-xs text-muted">الكود</label><input className="form-control" value={form.code || ''} onChange={e => set('code', e.target.value)} /></div>
                  <div className="col-md-4"><label className="form-label text-xs text-muted">الحالة</label>
                    <select className="form-select" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arabic */}
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">العربي</h6></div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted">الاسم *</label><input className="form-control" dir="rtl" value={form.nameAr || ''} onChange={e => set('nameAr', e.target.value)} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">الفرع</label>
                  <select className="form-select" value={form.branchAr || 'العلمي'} onChange={e => set('branchAr', e.target.value)}>
                    <option value="العلمي">العلمي</option>
                    <option value="الاحيائي">الاحيائي</option>
                    <option value="الأدبي">الأدبي</option>
                  </select>
                </div>
                <div><label className="form-label text-xs text-muted">الوصف</label><textarea className="form-control" rows={4} dir="rtl" value={form.descAr || ''} onChange={e => set('descAr', e.target.value)}></textarea></div>
              </div>
            </div>
          </div>

          {/* English */}
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">English</h6></div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted">Name *</label><input className="form-control" value={form.nameEn || ''} onChange={e => set('nameEn', e.target.value)} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">Branch</label>
                  <select className="form-select" value={form.branchEn || 'Scientific'} onChange={e => set('branchEn', e.target.value)}>
                    <option value="Scientific">Scientific</option>
                    <option value="Biology">Biology</option>
                    <option value="Literary">Literary</option>
                  </select>
                </div>
                <div><label className="form-label text-xs text-muted">Description</label><textarea className="form-control" rows={4} value={form.descEn || ''} onChange={e => set('descEn', e.target.value)}></textarea></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">الرسوم الدراسية ونسب القبول</h6></div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 border rounded-3 mb-3">
                  <h6 className="fw-semibold mb-3 text-primary"><i className="bi bi-sun me-1"></i>الدوام الصباحي</h6>
                  <div className="mb-3"><label className="form-label text-xs text-muted">الرسوم الدراسية (IQD)</label><input className="form-control" value={form.morning || ''} onChange={e => set('morning', e.target.value)} placeholder="3,000,000" /></div>
                  <div><label className="form-label text-xs text-muted">نسبة القبول</label><input className="form-control" value={form.morningRate || ''} onChange={e => set('morningRate', e.target.value)} placeholder="59.50%" /></div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded-3 mb-3">
                  <h6 className="fw-semibold mb-3 text-warning"><i className="bi bi-moon me-1"></i>الدوام المسائي</h6>
                  <div className="mb-3"><label className="form-label text-xs text-muted">الرسوم الدراسية (IQD) — 0 إذا لا يوجد</label><input className="form-control" value={form.evening || ''} onChange={e => set('evening', e.target.value)} placeholder="0" /></div>
                  <div><label className="form-label text-xs text-muted">نسبة القبول</label><input className="form-control" value={form.eveningRate || ''} onChange={e => set('eveningRate', e.target.value)} placeholder="0.00%" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">معلومات القسم الداخلية</h6></div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label text-xs text-muted">رئيس القسم</label><input className="form-control" dir="rtl" value={form.head || ''} onChange={e => set('head', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">الهاتف</label><input className="form-control" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">البريد الإلكتروني</label><input type="email" className="form-control" value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">الموقع / القاعة</label><input className="form-control" dir="rtl" value={form.location || ''} onChange={e => set('location', e.target.value)} /></div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 d-flex gap-2">
        {tab > 0 && <button className="btn btn-outline-secondary" onClick={() => setTab(v => v - 1)}>{t('form.prev')}</button>}
        {tab < 2 && <button className="btn btn-primary" onClick={() => setTab(v => v + 1)}>{t('form.next')}</button>}
        {tab === 2 && <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? t('form.saving') : t('form.save')}</button>}
        <button className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
      </div>
    </div>
  );
}

export default function EditDepartmentPage() { return <Suspense><EditForm /></Suspense>; }
