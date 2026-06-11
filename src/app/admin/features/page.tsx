'use client';
import { useEffect, useRef, useState } from 'react';
import { useAdminAPI, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

interface Feature { title: string; desc: string; more: string; href: string; img: string; youtube?: string; category?: string; date?: string; titleStyle?: TextStyle; descStyle?: TextStyle; }
const empty = (): Feature => ({ title: '', desc: '', more: '', href: '#', img: '', youtube: '', category: '', date: '', titleStyle: {}, descStyle: {} });

export default function FeaturesPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent, token } = useAdminAPI();
  const [arItems, setArItems] = useState<Feature[]>([]);
  const [enItems, setEnItems] = useState<Feature[]>([]);
  const [headingStyle, setHeadingStyle] = useState<TextStyle>({});
  const [uploading, setUploading] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetchContent().then(d => {
      const ar: any[] = Array.isArray(d.ar?.features) ? d.ar.features : [];
      const en: any[] = Array.isArray(d.en?.features) ? d.en.features : [];
      const count = Math.max(ar.length, en.length);
      const pad = (arr: any[]) => Array.from({ length: count }, (_, i) => ({
        title: arr[i]?.title || '', desc: arr[i]?.desc || '',
        more: arr[i]?.more || '', href: arr[i]?.href || '#', img: arr[i]?.img || '',
        titleStyle: arr[i]?.titleStyle || {}, descStyle: arr[i]?.descStyle || {},
        youtube: arr[i]?.youtube || '', category: arr[i]?.category || '', date: arr[i]?.date || '',
      }));
      setArItems(pad(ar)); setEnItems(pad(en));
      setHeadingStyle(d.ar?.news?.latestNewsTitleStyle || {});
    });
  }, []);

  const updAr = (i: number, k: keyof Feature, v: any) =>
    setArItems(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updEn = (i: number, k: keyof Feature, v: any) =>
    setEnItems(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const setImg = (i: number, url: string) => {
    setArItems(s => s.map((x, idx) => idx === i ? { ...x, img: url } : x));
    setEnItems(s => s.map((x, idx) => idx === i ? { ...x, img: url } : x));
  };

  const uploadImg = async (i: number, file: File) => {
    setUploading(i);
    const form = new FormData(); form.append('file', file);
    const r = await fetch(`/api/upload?token=${token}&name=feature${i + 1}`, { method: 'POST', body: form });
    const d = await r.json();
    if (d.url) setImg(i, d.url + '?t=' + Date.now());
    setUploading(null);
  };

  const addItem = () => { setArItems(s => [...s, empty()]); setEnItems(s => [...s, empty()]); };
  const removeItem = (i: number) => {
    setArItems(s => s.filter((_, idx) => idx !== i));
    setEnItems(s => s.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.features = arItems.map(f => ({ ...f }));
    d.en.features = enItems.map((f, i) => ({ ...f, youtube: arItems[i]?.youtube || '' }));
    d.ar.news = { ...(d.ar.news || {}), latestNewsTitleStyle: headingStyle };
    d.en.news = { ...(d.en.news || {}), latestNewsTitleStyle: headingStyle };
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved') || 'تم الحفظ');
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.features') || 'Feature Cards'}</h1></div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={addItem}><i className="bi bi-plus-lg me-1"></i>Add Card</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save All</>}
          </button>
        </div>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      {/* Heading style settings */}
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title mb-0">إعدادات عنوان &quot;آخر الأخبار&quot;</h5>
        </div>
        <div className="dashboard-card-body">
          <StyleBar label="آخر الأخبار" style={headingStyle} onChange={setHeadingStyle} />
        </div>
      </div>

      {arItems.map((_, i) => (
        <div key={i} className="dashboard-card mb-3">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">Card {i + 1}</h5>
            <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}><i className="bi bi-trash"></i></button>
          </div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              {/* Image */}
              <div className="col-12 col-md-2">
                <label className="form-label fw-semibold">Image</label>
                <div className="border rounded overflow-hidden mb-2" style={{ height: 110, background: '#f8f9fa', cursor: 'pointer', position: 'relative' }}
                  onClick={() => fileRefs.current[i]?.click()}>
                  {arItems[i]?.img ? (
                    <img src={arItems[i].img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted flex-column gap-1">
                      <i className="bi bi-image fs-2"></i><small>Upload</small>
                    </div>
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

              {/* YouTube + Category + Date */}
              <div className="col-12 col-md-2">
                <label className="form-label fw-semibold">YouTube</label>
                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="https://youtu.be/..."
                  value={arItems[i]?.youtube || ''}
                  onChange={e => { updAr(i, 'youtube', e.target.value); updEn(i, 'youtube', e.target.value); }}
                />
                <label className="form-label fw-semibold">التصنيف</label>
                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="نشاطات وفعاليات..."
                  dir="rtl"
                  value={arItems[i]?.category || ''}
                  onChange={e => updAr(i, 'category', e.target.value)}
                />
                <label className="form-label fw-semibold">تاريخ النشر</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={arItems[i]?.date || ''}
                  onChange={e => { updAr(i, 'date', e.target.value); updEn(i, 'date', e.target.value); }}
                />
                {arItems[i]?.date && (
                  <small className="text-muted d-block mt-1">
                    {(() => { const d = new Date(arItems[i].date!); const m = ['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول']; return `${d.getDate().toLocaleString('ar-EG')} ${m[d.getMonth()]} ${d.getFullYear().toLocaleString('ar-EG')}`; })()}
                  </small>
                )}
              </div>

              {/* Arabic */}
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">Arabic</label>
                <StyleBar label="Title" style={arItems[i]?.titleStyle || {}} onChange={v => updAr(i, 'titleStyle', v)} />
                <input className="form-control form-control-sm mb-2" placeholder="العنوان" dir="rtl" value={arItems[i]?.title || ''} onChange={e => updAr(i, 'title', e.target.value)} />
                <StyleBar label="Desc" style={arItems[i]?.descStyle || {}} onChange={v => updAr(i, 'descStyle', v)} />
                <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="الوصف" dir="rtl" value={arItems[i]?.desc || ''} onChange={e => updAr(i, 'desc', e.target.value)} />
                <input className="form-control form-control-sm" placeholder="نص الرابط" dir="rtl" value={arItems[i]?.more || ''} onChange={e => updAr(i, 'more', e.target.value)} />
              </div>

              {/* English */}
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold">English</label>
                <StyleBar label="Title" style={enItems[i]?.titleStyle || {}} onChange={v => updEn(i, 'titleStyle', v)} />
                <input className="form-control form-control-sm mb-2" placeholder="Title" value={enItems[i]?.title || ''} onChange={e => updEn(i, 'title', e.target.value)} />
                <StyleBar label="Desc" style={enItems[i]?.descStyle || {}} onChange={v => updEn(i, 'descStyle', v)} />
                <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Description" value={enItems[i]?.desc || ''} onChange={e => updEn(i, 'desc', e.target.value)} />
                <input className="form-control form-control-sm" placeholder="Link text" value={enItems[i]?.more || ''} onChange={e => updEn(i, 'more', e.target.value)} />
              </div>

              {/* Link */}
              <div className="col-12 col-md-2">
                <label className="form-label fw-semibold">Link</label>
                <input className="form-control form-control-sm" placeholder="/ar/..."
                  value={arItems[i]?.href || ''} onChange={e => { updAr(i, 'href', e.target.value); updEn(i, 'href', e.target.value); }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
