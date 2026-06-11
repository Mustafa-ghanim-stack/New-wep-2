'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

interface HL {
  title: string; titleStyle?: TextStyle;
  desc: string;  descStyle?: TextStyle;
  cta: string;   href: string;
  campaign_title: string; campaignTitleStyle?: TextStyle;
  campaign_sub: string;   campaignSubStyle?: TextStyle;
  campaign_desc: string;  campaignDescStyle?: TextStyle;
  campaign_cta: string;
}

const empty: HL = { title:'', desc:'', cta:'', href:'', campaign_title:'', campaign_sub:'', campaign_desc:'', campaign_cta:'' };

const STYLED: (keyof HL)[] = ['title','desc','campaign_title','campaign_sub','campaign_desc'];
const TEXTAREA: (keyof HL)[] = ['desc','campaign_desc','campaign_sub'];
const STYLE_KEY: Record<string, keyof HL> = {
  title: 'titleStyle', desc: 'descStyle',
  campaign_title: 'campaignTitleStyle', campaign_sub: 'campaignSubStyle', campaign_desc: 'campaignDescStyle',
};

export default function HighlightPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<HL>(empty);
  const [en, setEn] = useState<HL>(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.highlight) setAr({ ...empty, ...d.ar.highlight });
      if (d.en?.highlight) setEn({ ...empty, ...d.en.highlight });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.highlight = ar; d.en.highlight = en;
    await saveContent(d.ar, d.en);
    setSaving(false); setMsg(t('status.saved') || 'تم الحفظ');
    setTimeout(() => setMsg(''), 2000);
  };

  const renderField = (data: HL, setter: (fn: (s: HL) => HL) => void, k: keyof HL, label: string, rtl: boolean) => {
    const sk = STYLE_KEY[k as string] as keyof HL | undefined;
    return (
      <div className="mb-3" key={k as string}>
        <label className="form-label text-xs text-muted fw-semibold">{label}</label>
        {sk && <StyleBar style={(data[sk] as TextStyle) || {}} onChange={v => setter(s => ({ ...s, [sk]: v }))} />}
        {TEXTAREA.includes(k) ? (
          <textarea className="form-control form-control-sm" rows={3} dir={rtl ? 'rtl' : 'ltr'}
            value={(data[k] as string) || ''} onChange={e => setter(s => ({ ...s, [k]: e.target.value }))} />
        ) : (
          <input className="form-control form-control-sm" dir={rtl ? 'rtl' : 'ltr'}
            value={(data[k] as string) || ''} onChange={e => setter(s => ({ ...s, [k]: e.target.value }))} />
        )}
      </div>
    );
  };

  const renderEditor = (data: HL, setter: (fn: (s: HL) => HL) => void, rtl: boolean) => (
    <>
      <div className="dashboard-card mb-3">
        <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">Program Block</h6></div>
        <div className="dashboard-card-body">
          {renderField(data, setter, 'title', 'Title', rtl)}
          {renderField(data, setter, 'desc', 'Description', rtl)}
          {renderField(data, setter, 'cta', 'CTA Button', rtl)}
          {renderField(data, setter, 'href', 'Link (href)', rtl)}
        </div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-header"><h6 className="dashboard-card-title mb-0">Campaign Block</h6></div>
        <div className="dashboard-card-body">
          {renderField(data, setter, 'campaign_title', 'Campaign Title', rtl)}
          {renderField(data, setter, 'campaign_sub', 'Campaign Subtitle', rtl)}
          {renderField(data, setter, 'campaign_desc', 'Campaign Description', rtl)}
          {renderField(data, setter, 'campaign_cta', 'Campaign CTA', rtl)}
        </div>
      </div>
    </>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.highlight') || 'Highlight'}</h1></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save All</>}
        </button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="row g-3">
        <div className="col-12 col-md-6">{renderEditor(ar, setAr, true)}</div>
        <div className="col-12 col-md-6">{renderEditor(en, setEn, false)}</div>
      </div>
    </div>
  );
}
