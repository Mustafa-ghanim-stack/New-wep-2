'use client';
import { useEffect, useRef, useState } from 'react';
import { useAdminAPI, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

interface Slide { title: string; desc: string; img: string; titleStyle?: TextStyle; descStyle?: TextStyle; }

const DEFAULT_IMGS = ['/images/slide1.jpg', '/images/slide2.jpg', '/images/slide3.jpg', '/images/slide4.webp'];

export default function HeroPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent, token } = useAdminAPI();
  const [arSlides, setArSlides] = useState<Slide[]>([]);
  const [enSlides, setEnSlides] = useState<Slide[]>([]);
  const [arBanner, setArBanner] = useState({ title: '', body: '', titleStyle: {} as TextStyle, bodyStyle: {} as TextStyle });
  const [enBanner, setEnBanner] = useState({ title: '', body: '', titleStyle: {} as TextStyle, bodyStyle: {} as TextStyle });
  const [uploading, setUploading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetchContent().then(d => {
      const ar: any[] = Array.isArray(d.ar?.hero) ? d.ar.hero : [];
      const en: any[] = Array.isArray(d.en?.hero) ? d.en.hero : [];
      const count = Math.max(ar.length, en.length, 1);
      const pad = (arr: any[]) => Array.from({ length: count }, (_, i) => ({
        title: arr[i]?.title || '', desc: arr[i]?.desc || '',
        img: arr[i]?.img || DEFAULT_IMGS[i] || '',
        titleStyle: arr[i]?.titleStyle || {}, descStyle: arr[i]?.descStyle || {},
      }));
      setArSlides(pad(ar)); setEnSlides(pad(en));
      if (d.ar?.heroBanner) setArBanner({ title: d.ar.heroBanner.title || '', body: d.ar.heroBanner.body || '', titleStyle: d.ar.heroBanner.titleStyle || {}, bodyStyle: d.ar.heroBanner.bodyStyle || {} });
      if (d.en?.heroBanner) setEnBanner({ title: d.en.heroBanner.title || '', body: d.en.heroBanner.body || '', titleStyle: d.en.heroBanner.titleStyle || {}, bodyStyle: d.en.heroBanner.bodyStyle || {} });
    });
  }, []);

  const updAr = (i: number, k: keyof Slide, v: any) =>
    setArSlides(s => s.map((sl, idx) => idx === i ? { ...sl, [k]: v } : sl));
  const updEn = (i: number, k: keyof Slide, v: any) =>
    setEnSlides(s => s.map((sl, idx) => idx === i ? { ...sl, [k]: v } : sl));
  const setImg = (i: number, url: string) => {
    setArSlides(s => s.map((sl, idx) => idx === i ? { ...sl, img: url } : sl));
    setEnSlides(s => s.map((sl, idx) => idx === i ? { ...sl, img: url } : sl));
  };

  const uploadImg = async (i: number, file: File) => {
    setUploading(i);
    const form = new FormData(); form.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=slide${i + 1}`, { method: 'POST', body: form });
    const d = await r.json();
    if (d.url) setImg(i, d.url + '?t=' + Date.now());
    setUploading(null);
  };

  const addSlide = () => {
    const i = arSlides.length;
    setArSlides(s => [...s, { title: '', desc: '', img: DEFAULT_IMGS[i] || '', titleStyle: {}, descStyle: {} }]);
    setEnSlides(s => [...s, { title: '', desc: '', img: DEFAULT_IMGS[i] || '', titleStyle: {}, descStyle: {} }]);
  };
  const removeSlide = (i: number) => {
    setArSlides(s => s.filter((_, idx) => idx !== i));
    setEnSlides(s => s.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.hero = arSlides; d.en.hero = enSlides;
    d.ar.heroBanner = arBanner; d.en.heroBanner = enBanner;
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved') || 'تم الحفظ');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.hero') || 'Hero Slider'}</h1></div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={addSlide}><i className="bi bi-plus-lg me-1"></i>Add Slide</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save All</>}
          </button>
        </div>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {/* Banner text below slider */}
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title mb-0">النص أسفل الشريط الدوار</h5>
        </div>
        <div className="dashboard-card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Arabic</label>
              <StyleBar label="Title" style={arBanner.titleStyle} onChange={v => setArBanner(b => ({ ...b, titleStyle: v }))} />
              <input className="form-control form-control-sm mb-2" placeholder="العنوان" dir="rtl"
                value={arBanner.title} onChange={e => setArBanner(b => ({ ...b, title: e.target.value }))} />
              <StyleBar label="Text" style={arBanner.bodyStyle} onChange={v => setArBanner(b => ({ ...b, bodyStyle: v }))} />
              <textarea className="form-control form-control-sm" rows={5} placeholder="النص" dir="rtl"
                value={arBanner.body} onChange={e => setArBanner(b => ({ ...b, body: e.target.value }))} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">English</label>
              <StyleBar label="Title" style={enBanner.titleStyle} onChange={v => setEnBanner(b => ({ ...b, titleStyle: v }))} />
              <input className="form-control form-control-sm mb-2" placeholder="Title"
                value={enBanner.title} onChange={e => setEnBanner(b => ({ ...b, title: e.target.value }))} />
              <StyleBar label="Text" style={enBanner.bodyStyle} onChange={v => setEnBanner(b => ({ ...b, bodyStyle: v }))} />
              <textarea className="form-control form-control-sm" rows={5} placeholder="Text"
                value={enBanner.body} onChange={e => setEnBanner(b => ({ ...b, body: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      {arSlides.map((slide, i) => (
        <div key={i} className="dashboard-card mb-3">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">Slide {i + 1}</h5>
            {arSlides.length > 1 && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeSlide(i)}><i className="bi bi-trash"></i></button>
            )}
          </div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              {/* Image */}
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">Image</label>
                <div className="border rounded overflow-hidden mb-2" style={{ height: 140, background: '#f8f9fa', cursor: 'pointer', position: 'relative' }}
                  onClick={() => fileRefs.current[i]?.click()}>
                  {arSlides[i]?.img ? (
                    <img src={arSlides[i].img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted"><i className="bi bi-image fs-1"></i></div>
                  )}
                  {uploading === i && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <span className="spinner-border text-white"></span>
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => fileRefs.current[i]?.click()}><i className="bi bi-upload me-1"></i>Upload</button>
                <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/*" className="d-none"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(i, f); e.target.value = ''; }} />
              </div>

              {/* Arabic */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Arabic</label>
                <StyleBar label="Title" style={arSlides[i]?.titleStyle || {}} onChange={v => updAr(i, 'titleStyle', v)} />
                <input className="form-control mb-2" placeholder="العنوان" value={arSlides[i]?.title || ''} onChange={e => updAr(i, 'title', e.target.value)} dir="rtl" />
                <StyleBar label="Desc" style={arSlides[i]?.descStyle || {}} onChange={v => updAr(i, 'descStyle', v)} />
                <textarea className="form-control" rows={3} placeholder="الوصف" value={arSlides[i]?.desc || ''} onChange={e => updAr(i, 'desc', e.target.value)} dir="rtl" />
              </div>

              {/* English */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">English</label>
                <StyleBar label="Title" style={enSlides[i]?.titleStyle || {}} onChange={v => updEn(i, 'titleStyle', v)} />
                <input className="form-control mb-2" placeholder="Title" value={enSlides[i]?.title || ''} onChange={e => updEn(i, 'title', e.target.value)} />
                <StyleBar label="Desc" style={enSlides[i]?.descStyle || {}} onChange={v => updEn(i, 'descStyle', v)} />
                <textarea className="form-control" rows={3} placeholder="Description" value={enSlides[i]?.desc || ''} onChange={e => updEn(i, 'desc', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
