'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function FooterPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<any>({});
  const [en, setEn] = useState<any>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.footer) setAr(d.ar.footer);
      if (d.en?.footer) setEn(d.en.footer);
    });
  }, []);

  const save = async () => {
    const d = await fetchContent();
    d.ar.footer = ar; d.en.footer = en;
    await saveContent(d.ar, d.en);
    setMsg(t('status.saved')); setTimeout(() => setMsg(''), 2000);
  };

  const socialNetworks = ['facebook', 'twitterx', 'youtube', 'telegram', 'instagram', 'whatsapp', 'tiktok'];

  const upd = (data: any, setter: any, key: string, val: any) => setter({ ...data, [key]: val });
  const updStyle = (data: any, setter: any, key: string, val: TextStyle) => setter({ ...data, [key]: val });

  const renderEditor = (data: any, setter: any) => (
    <>
      {/* روابط سريعة */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2">روابط سريعة / Quick Links</h6>
        <StyleBar label="العنوان" style={data.quicklinksStyle || {}} onChange={v => updStyle(data, setter, 'quicklinksStyle', v)} />
        <input className="form-control form-control-sm mb-2" placeholder="Title" value={data.quicklinks?.title || ''} onChange={e => setter({ ...data, quicklinks: { ...data.quicklinks, title: e.target.value } })} />
        <StyleBar label="العناصر" style={data.quicklinksItemsStyle || {}} onChange={v => updStyle(data, setter, 'quicklinksItemsStyle', v)} />
        {(data.quicklinks?.items || []).map((item: string, i: number) => (
          <input key={i} className="form-control form-control-sm mb-1" value={item} onChange={e => {
            const items = [...(data.quicklinks?.items || [])];
            items[i] = e.target.value;
            setter({ ...data, quicklinks: { ...data.quicklinks, items } });
          }} />
        ))}
      </div>

      {/* الشهادات */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2">الشهادات / Certificates</h6>
        <StyleBar label="العنوان" style={data.certificatesStyle || {}} onChange={v => updStyle(data, setter, 'certificatesStyle', v)} />
        <input className="form-control form-control-sm mb-2" placeholder="Title" value={data.certificates?.title || ''} onChange={e => setter({ ...data, certificates: { ...data.certificates, title: e.target.value } })} />
        <StyleBar label="العناصر" style={data.certificatesItemsStyle || {}} onChange={v => updStyle(data, setter, 'certificatesItemsStyle', v)} />
        {(data.certificates?.items || []).map((item: string, i: number) => (
          <input key={i} className="form-control form-control-sm mb-1" value={item} onChange={e => {
            const items = [...(data.certificates?.items || [])];
            items[i] = e.target.value;
            setter({ ...data, certificates: { ...data.certificates, items } });
          }} />
        ))}
      </div>

      {/* تواصل معنا */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2">تواصل معنا / Contact</h6>
        <StyleBar label="العنوان" style={data.contactStyle || {}} onChange={v => updStyle(data, setter, 'contactStyle', v)} />
        <input className="form-control form-control-sm mb-2" placeholder="Title" value={data.contact?.title || ''} onChange={e => setter({ ...data, contact: { ...data.contact, title: e.target.value } })} />
        <StyleBar label="النص" style={data.contactTextStyle || {}} onChange={v => updStyle(data, setter, 'contactTextStyle', v)} />
        {(['address', 'phone', 'hours'] as const).map(k => (
          <div key={k} className="mb-2">
            <label className="form-label text-xs text-muted">{k}</label>
            <input className="form-control form-control-sm" value={(data.contact || {})[k] || ''} onChange={e => setter({ ...data, contact: { ...(data.contact || {}), [k]: e.target.value } })} />
          </div>
        ))}
      </div>

      {/* خريطة */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2"><i className="bi bi-geo-alt me-1"></i>رابط خريطة Google Maps</h6>
        <small className="text-muted d-block mb-2">افتح Google Maps → Share → Embed a map → انسخ رابط الـ src فقط</small>
        <input className="form-control form-control-sm" placeholder="https://www.google.com/maps/embed?pb=..." value={data.mapUrl || ''} onChange={e => setter({ ...data, mapUrl: e.target.value })} />
        {data.mapUrl && (
          <div className="mt-2 border rounded overflow-hidden" style={{ height: 120 }}>
            <iframe src={data.mapUrl} width="100%" height="120" style={{ border: 0 }} loading="lazy" />
          </div>
        )}
      </div>

      {/* السوشيال */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2">Social Title</h6>
        <StyleBar label="العنوان" style={data.socialTitleStyle || {}} onChange={v => updStyle(data, setter, 'socialTitleStyle', v)} />
        <input className="form-control form-control-sm mb-3" placeholder="Social title" value={data.social_title || ''} onChange={e => upd(data, setter, 'social_title', e.target.value)} />
        <h6 className="fw-semibold mb-2">Social Links</h6>
        <div className="row g-2">
          {socialNetworks.map(s => (
            <div className="col-6" key={s}>
              <label className="form-label text-xs text-muted">{s}</label>
              <input className="form-control form-control-sm" value={data.social?.[s] || ''} onChange={e => setter({ ...data, social: { ...(data.social || {}), [s]: e.target.value } })} />
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border rounded-3 p-3 mb-3">
        <h6 className="fw-semibold mb-2">Copyright</h6>
        <StyleBar label="النص" style={data.copyrightStyle || {}} onChange={v => updStyle(data, setter, 'copyrightStyle', v)} />
        <input className="form-control form-control-sm" value={data.copyright || ''} onChange={e => upd(data, setter, 'copyright', e.target.value)} />
      </div>
    </>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.footer')}</h1><p className="text-muted text-sm mb-0">{t('content.footer.subtitle')}</p></div>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg me-1"></i>Save All</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="dashboard-grid grid-cols-2">
        <EditorCard title="Arabic">{renderEditor(ar, setAr)}</EditorCard>
        <EditorCard title="English">{renderEditor(en, setEn)}</EditorCard>
      </div>
    </div>
  );
}
