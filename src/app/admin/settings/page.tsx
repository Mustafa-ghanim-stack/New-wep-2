'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

const SOCIAL_NETWORKS = [
  { key: 'facebook',  label: 'Facebook',  icon: 'facebook' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'youtube',   label: 'YouTube',   icon: 'youtube' },
  { key: 'tiktok',    label: 'TikTok',    icon: 'tiktok' },
  { key: 'telegram',  label: 'Telegram',  icon: 'telegram' },
  { key: 'twitter',   label: 'Twitter/X', icon: 'twitter-x' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: 'linkedin' },
  { key: 'whatsapp',  label: 'WhatsApp',  icon: 'whatsapp' },
];

const COLOR_KEYS = [
  { key: 'color-primary',       tKey: 'color.primary' },
  { key: 'color-primary-light', tKey: 'color.primaryLight' },
  { key: 'color-primary-dark',  tKey: 'color.primaryDark' },
  { key: 'color-accent',        tKey: 'color.accent' },
  { key: 'color-gray-light',    tKey: 'color.grayLight' },
  { key: 'color-gray-medium',   tKey: 'color.grayMedium' },
  { key: 'color-text-dark',     tKey: 'color.textDark' },
  { key: 'color-text-light',    tKey: 'color.textLight' },
];

const DEFAULT_COLORS: Record<string, string> = {
  'color-primary':       '#00ACC1',
  'color-primary-light': '#26C6DA',
  'color-primary-dark':  '#00838F',
  'color-accent':        '#f5a623',
  'color-gray-light':    '#f5f5f5',
  'color-gray-medium':   '#e0e0e0',
  'color-text-dark':     '#333333',
  'color-text-light':    '#666666',
};
const DEFAULT_INFO_AR  = { title: 'كلية الشرق', name: 'كلية الشرق', desc: 'كلية متميزة في التعليم والبحث العلمي' };
const DEFAULT_INFO_EN  = { title: 'Al-Sharq College', name: 'Al-Sharq College', desc: 'A distinguished college in education and scientific research' };
const DEFAULT_LOGO     = { url: '', width: '', alt: 'كلية الشرق', favicon: '', top: '64', start: '295' };
const DEFAULT_HERO_AR  = [{ title: 'مرحباً بكم في كلية الشرق', desc: 'نحن نقدم أفضل التعليم الأكاديمي لبناء مستقبل مشرق' }];
const DEFAULT_HERO_EN  = [{ title: 'Welcome to Al-Sharq College', desc: 'We provide the best academic education for a brighter future' }];
const DEFAULT_FOOTER_AR = { address: '', phone: '', hours: 'السبت – الخميس: 8 صباحاً – 4 مساءً', copyright: '© 2026 كلية الشرق. جميع الحقوق محفوظة.' };
const DEFAULT_FOOTER_EN = { address: '', phone: '', hours: 'Sat – Thu: 8 AM – 4 PM', copyright: '© 2026 Al-Sharq College. All rights reserved.' };
const DEFAULT_SOCIAL: Record<string, string> = {};

function UndoRedoBar({ hl, fl, onUndo, onRedo, onReset, resetTitle }: {
  hl: number; fl: number;
  onUndo: () => void; onRedo: () => void; onReset: () => void;
  resetTitle: string;
}) {
  const { t } = useAdminLang();
  return (
    <div className="d-flex gap-1">
      <button className="btn btn-sm btn-outline-secondary" onClick={onUndo} disabled={hl === 0}
        title={`${t('settings.undo')}${hl > 0 ? ` — ${hl}` : ''}`}>
        <i className="bi bi-arrow-counterclockwise"></i>
        {hl > 0 && <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>{hl}</span>}
      </button>
      <button className="btn btn-sm btn-outline-secondary" onClick={onRedo} disabled={fl === 0}
        title={`${t('settings.redo')}${fl > 0 ? ` — ${fl}` : ''}`}>
        <i className="bi bi-arrow-clockwise"></i>
        {fl > 0 && <span className="badge bg-secondary ms-1" style={{ fontSize: '0.65rem' }}>{fl}</span>}
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={onReset} title={resetTitle}>
        <i className="bi bi-slash-circle"></i>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent, token } = useAdminAPI();
  const [activeTab, setActiveTab] = useState('info');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'danger'>('success');
  const [saving, setSaving] = useState(false);
  const [showResetAll, setShowResetAll] = useState(false);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [arSite, setArSite] = useState({ title: '', name: '', desc: '' });
  const [arH, setArH] = useState<typeof arSite[]>([]);
  const [arF, setArF] = useState<typeof arSite[]>([]);
  const setArWithH = (next: typeof arSite) => { setArH(h => [...h, arSite]); setArF([]); setArSite(next); };
  const undoAr = () => { if (!arH.length) return; setArF(f => [arSite, ...f]); setArSite(arH[arH.length-1]); setArH(h => h.slice(0,-1)); };
  const redoAr = () => { if (!arF.length) return; setArH(h => [...h, arSite]); setArSite(arF[0]); setArF(f => f.slice(1)); };

  const [enSite, setEnSite] = useState({ title: '', name: '', desc: '' });
  const [enH, setEnH] = useState<typeof enSite[]>([]);
  const [enF, setEnF] = useState<typeof enSite[]>([]);
  const setEnWithH = (next: typeof enSite) => { setEnH(h => [...h, enSite]); setEnF([]); setEnSite(next); };
  const undoEn = () => { if (!enH.length) return; setEnF(f => [enSite, ...f]); setEnSite(enH[enH.length-1]); setEnH(h => h.slice(0,-1)); };
  const redoEn = () => { if (!enF.length) return; setEnH(h => [...h, enSite]); setEnSite(enF[0]); setEnF(f => f.slice(1)); };

  const [logo, setLogo] = useState({ url: '', width: '', alt: '', favicon: '', top: '', start: '' });
  const [logoH, setLogoH] = useState<typeof logo[]>([]);
  const [logoF, setLogoF] = useState<typeof logo[]>([]);
  const setLogoWithH = (next: typeof logo) => { setLogoH(h => [...h, logo]); setLogoF([]); setLogo(next); };
  const undoLogo = () => { if (!logoH.length) return; setLogoF(f => [logo, ...f]); setLogo(logoH[logoH.length-1]); setLogoH(h => h.slice(0,-1)); };
  const redoLogo = () => { if (!logoF.length) return; setLogoH(h => [...h, logo]); setLogo(logoF[0]); setLogoF(f => f.slice(1)); };

  type Slide = { title: string; desc: string };
  const [heroAr, setHeroAr] = useState<Slide[]>([]);
  const [heroEn, setHeroEn] = useState<Slide[]>([]);
  const [heroH, setHeroH] = useState<{ ar: Slide[]; en: Slide[] }[]>([]);
  const [heroF, setHeroF] = useState<{ ar: Slide[]; en: Slide[] }[]>([]);
  const setHeroWithH = (ar: Slide[], en: Slide[]) => {
    setHeroH(h => [...h, { ar: heroAr, en: heroEn }]);
    setHeroF([]);
    setHeroAr(ar); setHeroEn(en);
  };
  const undoHero = () => {
    if (!heroH.length) return;
    setHeroF(f => [{ ar: heroAr, en: heroEn }, ...f]);
    setHeroAr(heroH[heroH.length-1].ar); setHeroEn(heroH[heroH.length-1].en);
    setHeroH(h => h.slice(0,-1));
  };
  const redoHero = () => {
    if (!heroF.length) return;
    setHeroH(h => [...h, { ar: heroAr, en: heroEn }]);
    setHeroAr(heroF[0].ar); setHeroEn(heroF[0].en);
    setHeroF(f => f.slice(1));
  };

  const [footerAr, setFooterAr] = useState({ address: '', phone: '', hours: '', copyright: '' });
  const [footArH, setFootArH] = useState<typeof footerAr[]>([]);
  const [footArF, setFootArF] = useState<typeof footerAr[]>([]);
  const setFootArWithH = (next: typeof footerAr) => { setFootArH(h => [...h, footerAr]); setFootArF([]); setFooterAr(next); };
  const undoFootAr = () => { if (!footArH.length) return; setFootArF(f => [footerAr, ...f]); setFooterAr(footArH[footArH.length-1]); setFootArH(h => h.slice(0,-1)); };
  const redoFootAr = () => { if (!footArF.length) return; setFootArH(h => [...h, footerAr]); setFooterAr(footArF[0]); setFootArF(f => f.slice(1)); };

  const [footerEn, setFooterEn] = useState({ address: '', phone: '', hours: '', copyright: '' });
  const [footEnH, setFootEnH] = useState<typeof footerEn[]>([]);
  const [footEnF, setFootEnF] = useState<typeof footerEn[]>([]);
  const setFootEnWithH = (next: typeof footerEn) => { setFootEnH(h => [...h, footerEn]); setFootEnF([]); setFooterEn(next); };
  const undoFootEn = () => { if (!footEnH.length) return; setFootEnF(f => [footerEn, ...f]); setFooterEn(footEnH[footEnH.length-1]); setFootEnH(h => h.slice(0,-1)); };
  const redoFootEn = () => { if (!footEnF.length) return; setFootEnH(h => [...h, footerEn]); setFooterEn(footEnF[0]); setFootEnF(f => f.slice(1)); };

  const [social, setSocial] = useState<Record<string, string>>({});
  const [socialH, setSocialH] = useState<Record<string, string>[]>([]);
  const [socialF, setSocialF] = useState<Record<string, string>[]>([]);
  const setSocialWithH = (next: Record<string, string>) => { setSocialH(h => [...h, social]); setSocialF([]); setSocial(next); };
  const undoSocial = () => { if (!socialH.length) return; setSocialF(f => [social, ...f]); setSocial(socialH[socialH.length-1]); setSocialH(h => h.slice(0,-1)); };
  const redoSocial = () => { if (!socialF.length) return; setSocialH(h => [...h, social]); setSocial(socialF[0]); setSocialF(f => f.slice(1)); };

  const [theme, setTheme] = useState<Record<string, string>>({});
  const [arStyles, setArStyles] = useState<Record<string, TextStyle>>({});
  const [enStyles, setEnStyles] = useState<Record<string, TextStyle>>({});
  const [themeH, setThemeH] = useState<Record<string, string>[]>([]);
  const [themeF, setThemeF] = useState<Record<string, string>[]>([]);
  const setThemeWithH = (next: Record<string, string>) => { setThemeH(h => [...h, theme]); setThemeF([]); setTheme(next); };
  const undoTheme = () => { if (!themeH.length) return; setThemeF(f => [theme, ...f]); setTheme(themeH[themeH.length-1]); setThemeH(h => h.slice(0,-1)); };
  const redoTheme = () => { if (!themeF.length) return; setThemeH(h => [...h, theme]); setTheme(themeF[0]); setThemeF(f => f.slice(1)); };

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.site)  setArSite(d.ar.site);
      if (d.en?.site)  setEnSite(d.en.site);
      if (d.ar?.footer?.social) setSocial(d.ar.footer.social);
      if (d.theme)     setTheme(d.theme);
      if (d.ar?.logo)  setLogo({ url: '', width: '', alt: '', favicon: '', top: '', start: '', ...d.ar.logo });
      if (d.ar?.hero)  setHeroAr(d.ar.hero.map((h: any) => ({ title: h.title || '', desc: h.desc || '' })));
      if (d.en?.hero)  setHeroEn(d.en.hero.map((h: any) => ({ title: h.title || '', desc: h.desc || '' })));
      if (d.ar?.styles) setArStyles(d.ar.styles);
      if (d.en?.styles) setEnStyles(d.en.styles);
      if (d.ar?.footer?.contact) {
        setFooterAr({
          address: d.ar.footer.contact.address || '',
          phone:   d.ar.footer.contact.phone   || '',
          hours:   d.ar.footer.contact.hours   || '',
          copyright: d.ar.footer.copyright     || '',
        });
      }
      if (d.en?.footer?.contact) {
        setFooterEn({
          address: d.en.footer.contact.address || '',
          phone:   d.en.footer.contact.phone   || '',
          hours:   d.en.footer.contact.hours   || '',
          copyright: d.en.footer.copyright     || '',
        });
      }
    });
  }, []);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const saveStyles = async (d: any) => {
    d.ar.styles = { ...d.ar.styles, ...arStyles };
    d.en.styles = { ...d.en.styles, ...enStyles };
  };

  const saveInfo = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.site = { ...d.ar.site, ...arSite };
    d.en.site = { ...d.en.site, ...enSite };
    await saveStyles(d);
    const r = await saveContent(d.ar, d.en);
    setSaving(false);
    r.ok !== false ? showMsg(t('settings.msg.infoSaved')) : showMsg(t('err.saveFailed'), 'danger');
  };

  const savePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) return showMsg(t('settings.err.fillAll'), 'danger');
    if (newPass !== confirmPass)              return showMsg(t('settings.err.passwordMismatch'), 'danger');
    if (newPass.length < 4)                  return showMsg(t('settings.err.passwordShort'), 'danger');
    setSaving(true);
    const username = localStorage.getItem('admin_user') || 'admin';
    const res = await fetch('/api/auth/admins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username, oldPassword: oldPass, newPassword: newPass }),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) { setOldPass(''); setNewPass(''); setConfirmPass(''); showMsg(t('settings.msg.passwordChanged')); }
    else showMsg(d.error || t('settings.err.passwordFailed'), 'danger');
  };

  const saveSocial = async () => {
    setSaving(true);
    const d = await fetchContent();
    if (!d.ar.footer) d.ar.footer = {};
    if (!d.en.footer) d.en.footer = {};
    d.ar.footer.social = social;
    d.en.footer.social = social;
    await saveContent(d.ar, d.en);
    setSaving(false);
    showMsg(t('settings.msg.socialSaved'));
  };

  const saveColors = async () => {
    setSaving(true);
    const d = await fetchContent();
    await saveContent(d.ar, d.en, theme);
    setSaving(false);
    showMsg(t('settings.msg.colorsSaved'));
  };

  const saveLogo = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.logo = logo; d.en.logo = logo;
    await saveContent(d.ar, d.en);
    setSaving(false);
    showMsg(t('settings.msg.logoSaved'));
  };

  const saveHero = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.hero = heroAr; d.en.hero = heroEn;
    await saveStyles(d);
    await saveContent(d.ar, d.en);
    setSaving(false);
    showMsg(t('settings.msg.heroSaved'));
  };

  const saveFooter = async () => {
    setSaving(true);
    const d = await fetchContent();
    if (!d.ar.footer) d.ar.footer = {};
    if (!d.en.footer) d.en.footer = {};
    if (!d.ar.footer.contact) d.ar.footer.contact = {};
    if (!d.en.footer.contact) d.en.footer.contact = {};
    d.ar.footer.contact.address = footerAr.address;
    d.ar.footer.contact.phone   = footerAr.phone;
    d.ar.footer.contact.hours   = footerAr.hours;
    d.ar.footer.copyright       = footerAr.copyright;
    d.en.footer.contact.address = footerEn.address;
    d.en.footer.contact.phone   = footerEn.phone;
    d.en.footer.contact.hours   = footerEn.hours;
    d.en.footer.copyright       = footerEn.copyright;
    await saveStyles(d);
    await saveContent(d.ar, d.en);
    setSaving(false);
    showMsg(t('settings.msg.footerSaved'));
  };

  const resetAll = () => {
    setArH(h => [...h, arSite]); setArF([]); setArSite({ ...DEFAULT_INFO_AR });
    setEnH(h => [...h, enSite]); setEnF([]); setEnSite({ ...DEFAULT_INFO_EN });
    setLogoH(h => [...h, logo]); setLogoF([]); setLogo({ ...DEFAULT_LOGO });
    setHeroH(h => [...h, { ar: heroAr, en: heroEn }]); setHeroF([]);
    setHeroAr([...DEFAULT_HERO_AR]); setHeroEn([...DEFAULT_HERO_EN]);
    setFootArH(h => [...h, footerAr]); setFootArF([]); setFooterAr({ ...DEFAULT_FOOTER_AR });
    setFootEnH(h => [...h, footerEn]); setFootEnF([]); setFooterEn({ ...DEFAULT_FOOTER_EN });
    setSocialH(h => [...h, social]); setSocialF([]); setSocial({ ...DEFAULT_SOCIAL });
    setThemeH(h => [...h, theme]); setThemeF([]); setTheme({ ...DEFAULT_COLORS });
    setShowResetAll(false);
    showMsg(t('settings.msg.resetDone'));
  };

  const tabs = [
    { id: 'info',     labelKey: 'settings.tab.info',     icon: 'building' },
    { id: 'logo',     labelKey: 'settings.tab.logo',     icon: 'image' },
    { id: 'hero',     labelKey: 'settings.tab.hero',     icon: 'house' },
    { id: 'footer',   labelKey: 'settings.tab.footer',   icon: 'layout-text-window' },
    { id: 'social',   labelKey: 'settings.tab.social',   icon: 'share' },
    { id: 'colors',   labelKey: 'settings.tab.colors',   icon: 'palette' },
    { id: 'password', labelKey: 'settings.tab.password', icon: 'lock' },
  ];

  const saveActions: Record<string, () => void> = {
    info: saveInfo, logo: saveLogo, hero: saveHero,
    footer: saveFooter, social: saveSocial, colors: saveColors, password: savePassword,
  };

  const addHeroSlide = () => {
    setHeroWithH([...heroAr, { title: '', desc: '' }], [...heroEn, { title: '', desc: '' }]);
  };
  const removeHeroSlide = (i: number) => {
    setHeroWithH(heroAr.filter((_, idx) => idx !== i), heroEn.filter((_, idx) => idx !== i));
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">{t('system.settings')}</h1>
          <p className="text-muted text-sm mb-0">{t('system.settings.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger btn-sm" onClick={() => setShowResetAll(true)}>
            <i className="bi bi-arrow-counterclockwise me-1"></i>{t('settings.resetAll')}
          </button>
          <button className="btn btn-primary" onClick={saveActions[activeTab]} disabled={saving}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</>
              : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
          </button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType} py-2 mb-3`}>{msg}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-2">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi bi-${tab.icon} me-1`}></i>{t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* ── College Info ── */}
      {activeTab === 'info' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">{t('settings.info.ar')}</h5>
                <UndoRedoBar hl={arH.length} fl={arF.length} onUndo={undoAr} onRedo={redoAr}
                  onReset={() => { setArH(h => [...h, arSite]); setArF([]); setArSite({ ...DEFAULT_INFO_AR }); }}
                  resetTitle={t('settings.resetDefault')} />
              </div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.info.pageTitle')}</label>
                  <StyleBar style={arStyles['site_title'] || {}} onChange={v => setArStyles(s => ({...s, 'site_title': v}))} />
                  <input className="form-control" value={arSite.title} onChange={e => setArWithH({...arSite, title: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.info.collegeName')}</label>
                  <StyleBar style={arStyles['site_name'] || {}} onChange={v => setArStyles(s => ({...s, 'site_name': v}))} />
                  <input className="form-control" value={arSite.name} onChange={e => setArWithH({...arSite, name: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.info.desc')}</label>
                  <StyleBar style={arStyles['site_desc'] || {}} onChange={v => setArStyles(s => ({...s, 'site_desc': v}))} />
                  <textarea className="form-control" rows={3} value={arSite.desc} onChange={e => setArWithH({...arSite, desc: e.target.value})} /></div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">English</h5>
                <UndoRedoBar hl={enH.length} fl={enF.length} onUndo={undoEn} onRedo={redoEn}
                  onReset={() => { setEnH(h => [...h, enSite]); setEnF([]); setEnSite({ ...DEFAULT_INFO_EN }); }}
                  resetTitle="Reset to default" />
              </div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted">Page Title</label>
                  <StyleBar style={enStyles['site_title'] || {}} onChange={v => setEnStyles(s => ({...s, 'site_title': v}))} />
                  <input className="form-control" value={enSite.title} onChange={e => setEnWithH({...enSite, title: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">College Name</label>
                  <StyleBar style={enStyles['site_name'] || {}} onChange={v => setEnStyles(s => ({...s, 'site_name': v}))} />
                  <input className="form-control" value={enSite.name} onChange={e => setEnWithH({...enSite, name: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">Description</label>
                  <StyleBar style={enStyles['site_desc'] || {}} onChange={v => setEnStyles(s => ({...s, 'site_desc': v}))} />
                  <textarea className="form-control" rows={3} value={enSite.desc} onChange={e => setEnWithH({...enSite, desc: e.target.value})} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Logo ── */}
      {activeTab === 'logo' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">{t('settings.logo.title')}</h5>
                <UndoRedoBar hl={logoH.length} fl={logoF.length} onUndo={undoLogo} onRedo={redoLogo}
                  onReset={() => { setLogoH(h => [...h, logo]); setLogoF([]); setLogo({ ...DEFAULT_LOGO }); }}
                  resetTitle={t('settings.resetDefault')} />
              </div>
              <div className="dashboard-card-body">
                <div className="mb-3">
                  <label className="form-label text-xs text-muted">{t('settings.logo.url')}</label>
                  <input className="form-control" value={logo.url} onChange={e => setLogoWithH({...logo, url: e.target.value})} placeholder="/logo.png" />
                  <div className="form-text">{t('settings.logo.urlHint')}</div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-xs text-muted">{t('settings.logo.width')}</label>
                  <input type="number" className="form-control" value={logo.width} onChange={e => setLogoWithH({...logo, width: e.target.value})} placeholder="160" />
                </div>
                <div className="mb-3">
                  <label className="form-label text-xs text-muted">{t('settings.logo.alt')}</label>
                  <input className="form-control" value={logo.alt} onChange={e => setLogoWithH({...logo, alt: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-xs text-muted">{t('settings.logo.favicon')}</label>
                  <input className="form-control" value={logo.favicon} onChange={e => setLogoWithH({...logo, favicon: e.target.value})} placeholder="/favicon.ico" />
                  <div className="form-text">{t('settings.logo.faviconHint')}</div>
                </div>
                <hr className="my-3" />
                <p className="fw-semibold text-sm mb-3"><i className="bi bi-arrows-move me-1"></i>{t('settings.logo.position')}</p>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label text-xs text-muted">{t('settings.logo.top')}</label>
                    <div className="input-group input-group-sm">
                      <input type="number" className="form-control" value={logo.top} onChange={e => setLogoWithH({...logo, top: e.target.value})} placeholder="64" />
                      <span className="input-group-text">px</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-xs text-muted">{t('settings.logo.side')}</label>
                    <div className="input-group input-group-sm">
                      <input type="number" className="form-control" value={logo.start} onChange={e => setLogoWithH({...logo, start: e.target.value})} placeholder="295" />
                      <span className="input-group-text">px</span>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info py-2 small mb-0">
                  <i className="bi bi-info-circle me-1"></i>{t('settings.logo.posHint')}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('settings.logo.preview')}</h5></div>
              <div className="dashboard-card-body text-center py-4">
                {logo.url ? (
                  <div>
                    <img src={logo.url} alt={logo.alt || 'Logo'} style={{ maxWidth: logo.width ? `${logo.width}px` : '200px', maxHeight: 120, objectFit: 'contain' }} className="mb-3" onError={e => (e.currentTarget.style.display='none')} />
                    <p className="text-muted small">{t('settings.logo.current')}</p>
                  </div>
                ) : (
                  <div className="text-muted"><i className="bi bi-image" style={{ fontSize: 64 }}></i><p className="mt-2">{t('settings.logo.previewEmpty')}</p></div>
                )}
                {logo.favicon && (
                  <div className="mt-3 d-flex align-items-center justify-content-center gap-2">
                    <img src={logo.favicon} alt="favicon" width="32" height="32" style={{ objectFit: 'contain' }} onError={e => (e.currentTarget.style.display='none')} />
                    <span className="text-muted small">{t('settings.logo.faviconLabel')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      {activeTab === 'hero' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted small mb-0">{t('settings.hero.hint')}</p>
            <div className="d-flex gap-2">
              <UndoRedoBar hl={heroH.length} fl={heroF.length} onUndo={undoHero} onRedo={redoHero}
                onReset={() => { setHeroH(h => [...h, { ar: heroAr, en: heroEn }]); setHeroF([]); setHeroAr([...DEFAULT_HERO_AR]); setHeroEn([...DEFAULT_HERO_EN]); }}
                resetTitle={t('settings.resetDefault')} />
              <button className="btn btn-sm btn-outline-primary" onClick={addHeroSlide}><i className="bi bi-plus-lg me-1"></i>{t('settings.hero.addSlide')}</button>
            </div>
          </div>
          {heroAr.length === 0 ? (
            <div className="dashboard-card"><div className="dashboard-card-body text-center py-5 text-muted">
              <i className="bi bi-house" style={{ fontSize: 48 }}></i><p className="mt-2">{t('settings.hero.empty')}</p>
              <button className="btn btn-primary btn-sm" onClick={addHeroSlide}>{t('settings.hero.addSlide')}</button>
            </div></div>
          ) : (
            heroAr.map((slide, i) => (
              <div className="dashboard-card mb-3" key={i}>
                <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                  <h5 className="dashboard-card-title mb-0">{t('settings.hero.slide')} {i + 1}</h5>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeHeroSlide(i)}><i className="bi bi-trash"></i></button>
                </div>
                <div className="dashboard-card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p className="fw-semibold text-sm mb-2 text-primary">{t('settings.info.ar')}</p>
                      <div className="mb-2"><label className="form-label text-xs text-muted">{t('settings.hero.slide')} Title (AR)</label>
                        <StyleBar style={arStyles[`hero_${i}_title`] || {}} onChange={v => setArStyles(s => ({...s, [`hero_${i}_title`]: v}))} />
                        <input className="form-control" value={slide.title} onChange={e => { const arr=[...heroAr]; arr[i]={...arr[i],title:e.target.value}; setHeroWithH(arr, heroEn); }} /></div>
                      <div><label className="form-label text-xs text-muted">Description (AR)</label>
                        <StyleBar style={arStyles[`hero_${i}_desc`] || {}} onChange={v => setArStyles(s => ({...s, [`hero_${i}_desc`]: v}))} />
                        <textarea className="form-control" rows={2} value={slide.desc} onChange={e => { const arr=[...heroAr]; arr[i]={...arr[i],desc:e.target.value}; setHeroWithH(arr, heroEn); }} /></div>
                    </div>
                    <div className="col-md-6">
                      <p className="fw-semibold text-sm mb-2 text-primary">English</p>
                      <div className="mb-2"><label className="form-label text-xs text-muted">Title (EN)</label>
                        <StyleBar style={enStyles[`hero_${i}_title`] || {}} onChange={v => setEnStyles(s => ({...s, [`hero_${i}_title`]: v}))} />
                        <input className="form-control" value={heroEn[i]?.title || ''} onChange={e => { const arr=[...heroEn]; if(!arr[i]) arr[i]={title:'',desc:''}; arr[i]={...arr[i],title:e.target.value}; setHeroWithH(heroAr, arr); }} /></div>
                      <div><label className="form-label text-xs text-muted">Description (EN)</label>
                        <StyleBar style={enStyles[`hero_${i}_desc`] || {}} onChange={v => setEnStyles(s => ({...s, [`hero_${i}_desc`]: v}))} />
                        <textarea className="form-control" rows={2} value={heroEn[i]?.desc || ''} onChange={e => { const arr=[...heroEn]; if(!arr[i]) arr[i]={title:'',desc:''}; arr[i]={...arr[i],desc:e.target.value}; setHeroWithH(heroAr, arr); }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Footer ── */}
      {activeTab === 'footer' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">{t('settings.footer.ar')}</h5>
                <UndoRedoBar hl={footArH.length} fl={footArF.length} onUndo={undoFootAr} onRedo={redoFootAr}
                  onReset={() => { setFootArH(h => [...h, footerAr]); setFootArF([]); setFooterAr({ ...DEFAULT_FOOTER_AR }); }}
                  resetTitle={t('settings.resetDefault')} />
              </div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-geo-alt me-1"></i>{t('settings.footer.address')}</label>
                  <StyleBar style={arStyles['footer_address'] || {}} onChange={v => setArStyles(s => ({...s, 'footer_address': v}))} />
                  <input className="form-control" value={footerAr.address} onChange={e => setFootArWithH({...footerAr, address: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-telephone me-1"></i>{t('settings.footer.phone')}</label>
                  <StyleBar style={arStyles['footer_phone'] || {}} onChange={v => setArStyles(s => ({...s, 'footer_phone': v}))} />
                  <input className="form-control" value={footerAr.phone} onChange={e => setFootArWithH({...footerAr, phone: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-clock me-1"></i>{t('settings.footer.hours')}</label>
                  <StyleBar style={arStyles['footer_hours'] || {}} onChange={v => setArStyles(s => ({...s, 'footer_hours': v}))} />
                  <input className="form-control" value={footerAr.hours} onChange={e => setFootArWithH({...footerAr, hours: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-c-circle me-1"></i>{t('settings.footer.copyright')}</label>
                  <StyleBar style={arStyles['footer_copyright'] || {}} onChange={v => setArStyles(s => ({...s, 'footer_copyright': v}))} />
                  <input className="form-control" value={footerAr.copyright} onChange={e => setFootArWithH({...footerAr, copyright: e.target.value})} /></div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="dashboard-card">
              <div className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h5 className="dashboard-card-title mb-0">{t('settings.footer.en')}</h5>
                <UndoRedoBar hl={footEnH.length} fl={footEnF.length} onUndo={undoFootEn} onRedo={redoFootEn}
                  onReset={() => { setFootEnH(h => [...h, footerEn]); setFootEnF([]); setFooterEn({ ...DEFAULT_FOOTER_EN }); }}
                  resetTitle="Reset to default" />
              </div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-geo-alt me-1"></i>Address</label>
                  <StyleBar style={enStyles['footer_address'] || {}} onChange={v => setEnStyles(s => ({...s, 'footer_address': v}))} />
                  <input className="form-control" value={footerEn.address} onChange={e => setFootEnWithH({...footerEn, address: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-telephone me-1"></i>Phone</label>
                  <StyleBar style={enStyles['footer_phone'] || {}} onChange={v => setEnStyles(s => ({...s, 'footer_phone': v}))} />
                  <input className="form-control" value={footerEn.phone} onChange={e => setFootEnWithH({...footerEn, phone: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-clock me-1"></i>Working Hours</label>
                  <StyleBar style={enStyles['footer_hours'] || {}} onChange={v => setEnStyles(s => ({...s, 'footer_hours': v}))} />
                  <input className="form-control" value={footerEn.hours} onChange={e => setFootEnWithH({...footerEn, hours: e.target.value})} /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted"><i className="bi bi-c-circle me-1"></i>Copyright</label>
                  <StyleBar style={enStyles['footer_copyright'] || {}} onChange={v => setEnStyles(s => ({...s, 'footer_copyright': v}))} />
                  <input className="form-control" value={footerEn.copyright} onChange={e => setFootEnWithH({...footerEn, copyright: e.target.value})} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Social Links ── */}
      {activeTab === 'social' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">{t('settings.social.title')}</h5>
            <UndoRedoBar hl={socialH.length} fl={socialF.length} onUndo={undoSocial} onRedo={redoSocial}
              onReset={() => { setSocialH(h => [...h, social]); setSocialF([]); setSocial({ ...DEFAULT_SOCIAL }); }}
              resetTitle={t('settings.social.clearAll')} />
          </div>
          <div className="dashboard-card-body">
            <div className="row g-3">
              {SOCIAL_NETWORKS.map(s => (
                <div className="col-md-6" key={s.key}>
                  <label className="form-label text-xs text-muted"><i className={`bi bi-${s.icon} me-1`}></i>{s.label}</label>
                  <input className="form-control" type="url" placeholder="https://..." value={social[s.key] || ''}
                    onChange={e => setSocialWithH({...social, [s.key]: e.target.value})} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Colors ── */}
      {activeTab === 'colors' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">{t('settings.colors.title')}</h5>
            <UndoRedoBar hl={themeH.length} fl={themeF.length} onUndo={undoTheme} onRedo={redoTheme}
              onReset={() => { setThemeH(h => [...h, theme]); setThemeF([]); setTheme({ ...DEFAULT_COLORS }); }}
              resetTitle={t('settings.colors.reset')} />
          </div>
          <div className="dashboard-card-body">
            <div className="row g-4">
              {COLOR_KEYS.map(c => (
                <div className="col-md-6 col-lg-3" key={c.key}>
                  <label className="form-label text-xs text-muted">{t(c.tKey)}</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input type="color" className="form-control form-control-color flex-shrink-0" style={{ width: 48, height: 38 }}
                      value={theme[c.key] || '#000000'} onChange={e => setThemeWithH({...theme, [c.key]: e.target.value})} />
                    <input className="form-control form-control-sm" value={theme[c.key] || ''} placeholder="#hex"
                      onChange={e => setThemeWithH({...theme, [c.key]: e.target.value})} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Password ── */}
      {activeTab === 'password' && (
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('settings.password.title')}</h5></div>
              <div className="dashboard-card-body">
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.password.current')}</label>
                  <input type="password" className="form-control" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.password.new')}</label>
                  <input type="password" className="form-control" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" /></div>
                <div className="mb-3"><label className="form-label text-xs text-muted">{t('settings.password.confirm')}</label>
                  <input type="password" className="form-control" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="••••••••" /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset All Confirmation Modal ── */}
      {showResetAll && (
        <div className="modal-overlay" onClick={() => setShowResetAll(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-3">
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: 48 }}></i>
            </div>
            <h3 className="text-center">{t('settings.resetAllConfirm')}</h3>
            <p className="modal-text text-center">
              {t('settings.resetAllDesc')}
              <br />
              <span className="text-danger fw-semibold">{t('settings.resetAllDesc2')}</span>
            </p>
            <div className="modal-actions justify-content-center gap-3">
              <button className="btn btn-outline-secondary" onClick={() => setShowResetAll(false)}>
                <i className="bi bi-x-lg me-1"></i>{t('form.cancel')}
              </button>
              <button className="btn btn-danger" onClick={resetAll}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>{t('settings.resetAllBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
