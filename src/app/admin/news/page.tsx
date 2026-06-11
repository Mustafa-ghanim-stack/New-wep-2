'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard, FieldEditor, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function NewsPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<any>({ news: { title: '', titleStyle: {}, items: [] }, events: { title: '', titleStyle: {}, items: [] } });
  const [en, setEn] = useState<any>({ news: { title: '', titleStyle: {}, items: [] }, events: { title: '', titleStyle: {}, items: [] } });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.news) setAr(d.ar);
      if (d.en?.news) setEn(d.en);
    });
  }, []);

  const save = async () => {
    const d = await fetchContent();
    d.ar.news = ar.news; d.ar.events = ar.events;
    d.en.news = en.news; d.en.events = en.events;
    await saveContent(d.ar, d.en);
    setMsg(t('status.saved') || 'تم الحفظ'); setTimeout(() => setMsg(''), 2000);
  };

  const renderSection = (data: any, setter: any, section: 'news' | 'events', label: string, rtl: boolean) => (
    <div className="dashboard-card mb-3">
      <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">{label}</h6></div>
      <div className="dashboard-card-body">
        <StyleBar
          style={data[section]?.titleStyle || {}}
          onChange={v => setter({ ...data, [section]: { ...data[section], titleStyle: v } })}
        />
        <input className="form-control form-control-sm mb-3" placeholder="Section Title" dir={rtl ? 'rtl' : 'ltr'}
          value={data[section]?.title || ''}
          onChange={e => setter({ ...data, [section]: { ...data[section], title: e.target.value } })} />
        <FieldEditor
          items={data[section]?.items || []}
          setItems={items => setter({ ...data, [section]: { ...data[section], items } })}
          fields={[
            { key: 'date', label: 'Date', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'href', label: 'Link', type: 'text' },
          ]}
        />
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.news') || 'News & Events'}</h1></div>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg me-1"></i>Save All</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <h6 className="fw-semibold mb-2">Arabic</h6>
          {renderSection(ar, setAr, 'news', 'News', true)}
          {renderSection(ar, setAr, 'events', 'Events', true)}
        </div>
        <div className="col-12 col-md-6">
          <h6 className="fw-semibold mb-2">English</h6>
          {renderSection(en, setEn, 'news', 'News', false)}
          {renderSection(en, setEn, 'events', 'Events', false)}
        </div>
      </div>
    </div>
  );
}
