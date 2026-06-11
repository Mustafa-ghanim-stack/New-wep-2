'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard, StyleBar, TextStyle } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function NavPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [arNav, setArNav] = useState<any[]>([]);
  const [enNav, setEnNav] = useState<any[]>([]);
  const [arStyles, setArStyles] = useState<Record<string, TextStyle>>({});
  const [enStyles, setEnStyles] = useState<Record<string, TextStyle>>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.nav) setArNav(d.ar.nav);
      if (d.en?.nav) setEnNav(d.en.nav);
      if (d.ar?.navStyles) setArStyles(d.ar.navStyles);
      if (d.en?.navStyles) setEnStyles(d.en.navStyles);
    });
  }, []);

  const save = async () => {
    const d = await fetchContent();
    d.ar.nav = arNav; d.en.nav = enNav;
    d.ar.navStyles = arStyles; d.en.navStyles = enStyles;
    await saveContent(d.ar, d.en);
    setMsg(t('status.saved')); setTimeout(() => setMsg(''), 2000);
  };

  const addNavItem = (lang: 'ar' | 'en') => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? arNav : enNav;
    setter([...items, { label: '', href: '', children: [] }]);
  };

  const updateNavItem = (lang: 'ar' | 'en', idx: number, key: string, val: string) => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? [...arNav] : [...enNav];
    items[idx] = { ...items[idx], [key]: val };
    setter(items);
  };

  const removeNavItem = (lang: 'ar' | 'en', idx: number) => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? arNav : enNav;
    setter(items.filter((_, i) => i !== idx));
  };

  const addChild = (lang: 'ar' | 'en', parentIdx: number) => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? [...arNav] : [...enNav];
    items[parentIdx].children = [...(items[parentIdx].children || []), { label: '', href: '' }];
    setter(items);
  };

  const updateChild = (lang: 'ar' | 'en', parentIdx: number, childIdx: number, key: string, val: string) => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? [...arNav] : [...enNav];
    items[parentIdx].children[childIdx] = { ...items[parentIdx].children[childIdx], [key]: val };
    setter(items);
  };

  const removeChild = (lang: 'ar' | 'en', parentIdx: number, childIdx: number) => {
    const setter = lang === 'ar' ? setArNav : setEnNav;
    const items = lang === 'ar' ? [...arNav] : [...enNav];
    items[parentIdx].children = items[parentIdx].children.filter((_: any, i: number) => i !== childIdx);
    setter(items);
  };

  const renderNavEditor = (lang: 'ar' | 'en', items: any[], styles: Record<string, TextStyle>, setStyles: any) => (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border rounded-3 p-3 mb-3">
          <div className="d-flex gap-2 mb-2">
            <button className="btn btn-sm btn-outline-danger" onClick={() => removeNavItem(lang, i)}><i className="bi bi-trash"></i></button>
          </div>
          <StyleBar
            label={item.label || `#${i + 1}`}
            style={styles[String(i)] || {}}
            onChange={val => setStyles((s: any) => ({ ...s, [String(i)]: val }))}
          />
          <div className="row g-2 mb-2">
            <div className="col"><label className="text-xs text-muted">Label</label><input className="form-control form-control-sm" value={item.label} onChange={e => updateNavItem(lang, i, 'label', e.target.value)} /></div>
            <div className="col"><label className="text-xs text-muted">Href</label><input className="form-control form-control-sm" value={item.href} onChange={e => updateNavItem(lang, i, 'href', e.target.value)} /></div>
          </div>
          {(item.children || []).map((child: any, ci: number) => (
            <div key={ci} className="d-flex gap-2 ms-4 mb-2 align-items-end">
              <div><label className="text-xs text-muted">Child Label</label><input className="form-control form-control-sm" value={child.label} onChange={e => updateChild(lang, i, ci, 'label', e.target.value)} /></div>
              <div><label className="text-xs text-muted">Href</label><input className="form-control form-control-sm" value={child.href} onChange={e => updateChild(lang, i, ci, 'href', e.target.value)} /></div>
              <button className="btn btn-sm btn-outline-danger mb-0" onClick={() => removeChild(lang, i, ci)}><i className="bi bi-x"></i></button>
            </div>
          ))}
          <button className="btn btn-sm btn-outline-secondary" onClick={() => addChild(lang, i)}><i className="bi bi-plus me-1"></i>Add Child</button>
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={() => addNavItem(lang)}><i className="bi bi-plus-lg me-1"></i>Add Nav Item</button>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.nav')}</h1><p className="text-muted text-sm mb-0">{t('content.nav.subtitle')}</p></div>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg me-1"></i>Save All</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="dashboard-grid grid-cols-2">
        <EditorCard title="Arabic Navigation">{renderNavEditor('ar', arNav, arStyles, setArStyles)}</EditorCard>
        <EditorCard title="English Navigation">{renderNavEditor('en', enNav, enStyles, setEnStyles)}</EditorCard>
      </div>
    </div>
  );
}
