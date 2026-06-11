'use client';
import { useEffect, useState, useRef } from 'react';
import { useAdminAPI, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

interface SideCard { title: string; desc: string; more: string; href?: string; img?: string; titleStyle?: TextStyle; descStyle?: TextStyle; }
const empty = (): SideCard => ({ title: '', desc: '', more: '', href: '#', img: '', titleStyle: {}, descStyle: {} });

export default function SidecardsPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [arItems, setArItems] = useState<SideCard[]>([]);
  const [enItems, setEnItems] = useState<SideCard[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || ''
    : '';

  useEffect(() => {
    fetchContent().then(d => {
      const ar: any[] = Array.isArray(d.ar?.sidecards) ? d.ar.sidecards : [];
      const en: any[] = Array.isArray(d.en?.sidecards) ? d.en.sidecards : [];
      const count = Math.max(ar.length, en.length);
      const pad = (arr: any[]) => Array.from({ length: count }, (_, i) => ({
        title: arr[i]?.title || '', desc: arr[i]?.desc || '', more: arr[i]?.more || '',
        href: arr[i]?.href || '#', img: arr[i]?.img || '',
        titleStyle: arr[i]?.titleStyle || {}, descStyle: arr[i]?.descStyle || {},
      }));
      setArItems(pad(ar)); setEnItems(pad(en));
    });
  }, []);

  const updAr = (i: number, k: keyof SideCard, v: any) =>
    setArItems(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updEn = (i: number, k: keyof SideCard, v: any) =>
    setEnItems(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  const setImg = (i: number, url: string) => {
    setArItems(s => s.map((x, idx) => idx === i ? { ...x, img: url } : x));
    setEnItems(s => s.map((x, idx) => idx === i ? { ...x, img: url } : x));
  };

  const uploadImg = async (i: number, file: File) => {
    setUploading(i);
    const form = new FormData(); form.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=sidecard${i + 1}`, { method: 'POST', body: form });
    const d = await r.json();
    if (d.url) setImg(i, d.url + '?t=' + Date.now());
    setUploading(null);
  };

  const remove = (i: number) => {
    setArItems(s => s.filter((_, idx) => idx !== i));
    setEnItems(s => s.filter((_, idx) => idx !== i));
  };
  const add = () => { setArItems(s => [...s, empty()]); setEnItems(s => [...s, empty()]); };

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.sidecards = arItems; d.en.sidecards = enItems;
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved') || 'تم الحفظ');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.sidecards') || 'Side Cards'}</h1></div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={add}><i className="bi bi-plus-lg me-1"></i>Add Card</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save All</>}
          </button>
        </div>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {arItems.map((_, i) => (
        <div key={i} className="dashboard-card mb-3">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">Card {i + 1}</h5>
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(i)}><i className="bi bi-trash"></i></button>
          </div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              {/* الصورة */}
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">الصورة</label>
                <div className="position-relative rounded overflow-hidden mb-2"
                  style={{ height: 140, background: '#f0f0f0', cursor: 'pointer' }}
                  onClick={() => fileRefs.current[i]?.click()}>
                  {arItems[i]?.img ? (
                    <img src={arItems[i].img} alt="" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <i className="bi bi-image fs-2"></i><small>Upload</small>
                    </div>
                  )}
                  {uploading === i && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <span className="spinner-border text-white"></span>
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => fileRefs.current[i]?.click()}>
                  <i className="bi bi-upload me-1"></i>رفع صورة
                </button>
                <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/*" className="d-none"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(i, f); e.target.value = ''; }} />
                {arItems[i]?.img && (
                  <button className="btn btn-sm btn-outline-danger w-100 mt-1" onClick={() => setImg(i, '')}>
                    <i className="bi bi-x me-1"></i>إزالة
                  </button>
                )}
              </div>

              {/* عربي */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Arabic</label>
                <StyleBar label="Title" style={arItems[i]?.titleStyle || {}} onChange={v => updAr(i, 'titleStyle', v)} />
                <input className="form-control form-control-sm mb-2" placeholder="العنوان" dir="rtl"
                  value={arItems[i]?.title || ''} onChange={e => updAr(i, 'title', e.target.value)} />
                <StyleBar label="Desc" style={arItems[i]?.descStyle || {}} onChange={v => updAr(i, 'descStyle', v)} />
                <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="الوصف" dir="rtl"
                  value={arItems[i]?.desc || ''} onChange={e => updAr(i, 'desc', e.target.value)} />
                <input className="form-control form-control-sm mb-2" placeholder="نص الرابط" dir="rtl"
                  value={arItems[i]?.more || ''} onChange={e => updAr(i, 'more', e.target.value)} />
                <input className="form-control form-control-sm" placeholder="رابط البطاقة (href)"
                  value={arItems[i]?.href || ''} onChange={e => updAr(i, 'href', e.target.value)} />
              </div>

              {/* إنجليزي */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">English</label>
                <StyleBar label="Title" style={enItems[i]?.titleStyle || {}} onChange={v => updEn(i, 'titleStyle', v)} />
                <input className="form-control form-control-sm mb-2" placeholder="Title"
                  value={enItems[i]?.title || ''} onChange={e => updEn(i, 'title', e.target.value)} />
                <StyleBar label="Desc" style={enItems[i]?.descStyle || {}} onChange={v => updEn(i, 'descStyle', v)} />
                <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Description"
                  value={enItems[i]?.desc || ''} onChange={e => updEn(i, 'desc', e.target.value)} />
                <input className="form-control form-control-sm mb-2" placeholder="Link text"
                  value={enItems[i]?.more || ''} onChange={e => updEn(i, 'more', e.target.value)} />
                <input className="form-control form-control-sm" placeholder="Card link (href)"
                  value={enItems[i]?.href || ''} onChange={e => updEn(i, 'href', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
