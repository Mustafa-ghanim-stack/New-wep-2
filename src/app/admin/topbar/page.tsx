'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function TopbarPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState({ english: '', arabic: '', login: '' });
  const [en, setEn] = useState({ english: '', arabic: '', login: '' });
  const [arStyles, setArStyles] = useState<Record<string, TextStyle>>({});
  const [enStyles, setEnStyles] = useState<Record<string, TextStyle>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.topbar) setAr(d.ar.topbar);
      if (d.en?.topbar) setEn(d.en.topbar);
      if (d.ar?.topbarStyles) setArStyles(d.ar.topbarStyles);
      if (d.en?.topbarStyles) setEnStyles(d.en.topbarStyles);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.topbar = ar; d.en.topbar = en;
    d.ar.topbarStyles = arStyles; d.en.topbarStyles = enStyles;
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved'));
    setTimeout(() => setMsg(''), 2000);
  };

  const labels: Record<string, string> = { english: 'زر English', arabic: 'زر العربية', login: 'زر تسجيل الدخول' };

  const renderFields = (data: any, setData: any, styles: Record<string, TextStyle>, setStyles: any, lang: string) => (
    Object.entries(data).map(([k, v]) => (
      <div className="mb-3" key={k}>
        <label className="form-label text-xs text-muted">{lang === 'ar' ? labels[k] || k : k}</label>
        <StyleBar style={styles[k] || {}} onChange={val => setStyles((s: any) => ({ ...s, [k]: val }))} />
        <input className="form-control" value={v as string} onChange={e => setData({ ...data, [k]: e.target.value })} />
      </div>
    ))
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.topbar')}</h1><p className="text-muted text-sm mb-0">{t('content.topbar.subtitle')}</p></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}><i className="bi bi-check-lg me-1"></i>Save All</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="dashboard-grid grid-cols-2">
        <EditorCard title="Arabic">{renderFields(ar, setAr, arStyles, setArStyles, 'ar')}</EditorCard>
        <EditorCard title="English">{renderFields(en, setEn, enStyles, setEnStyles, 'en')}</EditorCard>
      </div>
    </div>
  );
}
