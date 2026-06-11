'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function QuicklinksPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [arItems, setArItems] = useState<any[]>([]);
  const [enItems, setEnItems] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.quicklinks?.items) setArItems(d.ar.quicklinks.items);
      if (d.en?.quicklinks?.items) setEnItems(d.en.quicklinks.items);
    });
  }, []);

  const save = async () => {
    const d = await fetchContent();
    d.ar.quicklinks = { items: arItems }; d.en.quicklinks = { items: enItems };
    await saveContent(d.ar, d.en);
    setMsg(t('status.saved')); setTimeout(() => setMsg(''), 2000);
  };

  const renderEditor = (items: any[], setter: any) => (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border rounded-3 p-3 mb-3">
          <div className="d-flex gap-2 mb-2">
            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => setter(items.filter((_: any, idx: number) => idx !== i))}><i className="bi bi-trash"></i></button>
          </div>
          <div className="row g-2">
            <div className="col"><label className="text-xs text-muted">Label</label><input className="form-control form-control-sm" value={item.label} onChange={e => { const arr = [...items]; arr[i] = { ...arr[i], label: e.target.value }; setter(arr); }} /></div>
            <div className="col"><label className="text-xs text-muted">Href</label><input className="form-control form-control-sm" value={item.href} onChange={e => { const arr = [...items]; arr[i] = { ...arr[i], href: e.target.value }; setter(arr); }} /></div>
          </div>
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={() => setter([...items, { label: '', href: '' }])}><i className="bi bi-plus-lg me-1"></i>Add Item</button>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.quicklinks')}</h1><p className="text-muted text-sm mb-0">{t('content.quicklinks.subtitle')}</p></div>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-check-lg me-1"></i>Save All</button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}
      <div className="dashboard-grid grid-cols-2">
        <EditorCard title="Arabic">{renderEditor(arItems, setArItems)}</EditorCard>
        <EditorCard title="English">{renderEditor(enItems, setEnItems)}</EditorCard>
      </div>
    </div>
  );
}
