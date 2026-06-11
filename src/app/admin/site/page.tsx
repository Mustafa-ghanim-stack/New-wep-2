'use client';
import { useEffect, useState, useRef } from 'react';
import { useAdminAPI, EditorCard, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function SitePage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<{ title: string; name: string; desc: string; nameStyle?: TextStyle; descStyle?: TextStyle }>({ title: '', name: '', desc: '' });
  const [en, setEn] = useState<{ title: string; name: string; desc: string; nameStyle?: TextStyle; descStyle?: TextStyle }>({ title: '', name: '', desc: '' });
  const [logo, setLogo] = useState({ url: '', alt: '', width: '', top: '50', start: '220' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.site) setAr(d.ar.site);
      if (d.en?.site) setEn(d.en.site);
      if (d.ar?.logo) setLogo({ url: '', alt: '', width: '', top: '50', start: '220', ...d.ar.logo });
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const token = (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')) || '';
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(`/api/upload?token=${token}`, { method: 'POST', body: form });
    const d = await r.json();
    if (d.url) setLogo(l => ({ ...l, url: d.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.site = ar; d.en.site = en;
    d.ar.logo = logo; d.en.logo = logo;
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved') || 'تم الحفظ');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">{t('content.site')}</h1>
          <p className="text-muted text-sm mb-0">{t('content.site.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save All</>}
        </button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {/* ── LOGO SECTION ── */}
      <div className="form-card mb-4">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-image" style={{ color: '#1976d2' }}></i>
          الشعار — يطبق على جميع الصفحات
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Preview */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ border: '2px dashed #e0e0e0', borderRadius: 12, padding: 16, background: '#f8f9fa', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logo.url ? (
                <img src={logo.url} alt={logo.alt || 'Logo'} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>
                  <i className="bi bi-image" style={{ fontSize: '2rem', display: 'block', marginBottom: 4 }}></i>
                  لا يوجد شعار
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            <button
              className="btn btn-primary mt-2 w-100"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: '0.82rem' }}
            >
              {uploading ? <><span className="spinner-border spinner-border-sm me-1"></span>جارٍ الرفع...</> : <><i className="bi bi-upload me-1"></i>رفع شعار</>}
            </button>
            {logo.url && (
              <button
                className="btn btn-secondary mt-1 w-100"
                onClick={() => setLogo(l => ({ ...l, url: '' }))}
                style={{ fontSize: '0.78rem' }}
              >
                <i className="bi bi-x me-1"></i>إزالة
              </button>
            )}
          </div>

          {/* Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>رابط الشعار (URL يدوي أو بعد الرفع)</label>
              <input className="admin-input" value={logo.url} onChange={e => setLogo(l => ({ ...l, url: e.target.value }))} placeholder="/images/logo.png" />
            </div>
            <div className="form-group">
              <label>النص البديل (alt)</label>
              <input className="admin-input" value={logo.alt} onChange={e => setLogo(l => ({ ...l, alt: e.target.value }))} placeholder="كلية الشرق" />
            </div>
            <div className="form-group">
              <label>العرض (px)</label>
              <input className="admin-input" type="number" value={logo.width} onChange={e => setLogo(l => ({ ...l, width: e.target.value }))} placeholder="تلقائي" />
            </div>
            <div className="form-group">
              <label>الموضع من الأعلى (top px)</label>
              <input className="admin-input" type="number" value={logo.top} onChange={e => setLogo(l => ({ ...l, top: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>الموضع الأفقي (start px)</label>
              <input className="admin-input" type="number" value={logo.start} onChange={e => setLogo(l => ({ ...l, start: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SITE INFO ── */}
      <div className="dashboard-grid grid-cols-2">
        <EditorCard title="Arabic" desc="Site info in Arabic">
          <div className="mb-3"><label className="form-label text-xs text-muted">Title (Tab)</label><input className="form-control" value={ar.title} onChange={e => setAr({...ar, title: e.target.value})} /></div>
          <div className="mb-3">
            <label className="form-label text-xs text-muted">Name</label>
            <StyleBar style={ar.nameStyle || {}} onChange={v => setAr({...ar, nameStyle: v})} />
            <input className="form-control" dir="rtl" value={ar.name} onChange={e => setAr({...ar, name: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="form-label text-xs text-muted">Description</label>
            <StyleBar style={ar.descStyle || {}} onChange={v => setAr({...ar, descStyle: v})} />
            <textarea className="form-control" rows={3} dir="rtl" value={ar.desc} onChange={e => setAr({...ar, desc: e.target.value})} />
          </div>
        </EditorCard>
        <EditorCard title="English" desc="Site info in English">
          <div className="mb-3"><label className="form-label text-xs text-muted">Title (Tab)</label><input className="form-control" value={en.title} onChange={e => setEn({...en, title: e.target.value})} /></div>
          <div className="mb-3">
            <label className="form-label text-xs text-muted">Name</label>
            <StyleBar style={en.nameStyle || {}} onChange={v => setEn({...en, nameStyle: v})} />
            <input className="form-control" value={en.name} onChange={e => setEn({...en, name: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="form-label text-xs text-muted">Description</label>
            <StyleBar style={en.descStyle || {}} onChange={v => setEn({...en, descStyle: v})} />
            <textarea className="form-control" rows={3} value={en.desc} onChange={e => setEn({...en, desc: e.target.value})} />
          </div>
        </EditorCard>
      </div>
    </div>
  );
}
