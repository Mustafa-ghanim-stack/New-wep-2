'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, EditorCard } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function ChatPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<any>({});
  const [en, setEn] = useState<any>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.chat) setAr(d.ar.chat);
      if (d.en?.chat) setEn(d.en.chat);
    });
  }, []);

  const save = async () => {
    const d = await fetchContent();
    d.ar.chat = ar; d.en.chat = en;
    await saveContent(d.ar, d.en);
    setMsg(t('status.saved')); setTimeout(() => setMsg(''), 2000);
  };

  const renderArrayEditor = (items: any[], setter: any, title: string) => (
    <div className="mb-3">
      <h6 className="fw-semibold mb-2">{title}</h6>
      {items.map((item, i) => (
        <div key={i} className="d-flex gap-2 mb-2">
          <input className="form-control form-control-sm" value={typeof item === 'string' ? item : item.text || ''} onChange={e => {
            const arr = [...items];
            arr[i] = typeof item === 'string' ? e.target.value : { ...item, text: e.target.value };
            setter(arr);
          }} />
          <button className="btn btn-sm btn-outline-danger" onClick={() => setter(items.filter((_: any, idx: number) => idx !== i))}><i className="bi bi-x"></i></button>
        </div>
      ))}
      <button className="btn btn-sm btn-outline-primary" onClick={() => setter([...items, ''])}><i className="bi bi-plus me-1"></i>Add</button>
    </div>
  );

  const renderEditor = (data: any, setter: any) => (
    <>
      {['title', 'welcome', 'send', 'close'].map(k => (
        <div className="mb-2" key={k}>
          <label className="form-label text-xs text-muted">{k}</label>
          <input className="form-control form-control-sm" value={data[k] || ''} onChange={e => setter({...data, [k]: e.target.value})} />
        </div>
      ))}
      {renderArrayEditor(data.responses || [], (arr: any) => setter({...data, responses: arr}), 'Responses')}
      {renderArrayEditor(data.greetings || [], (arr: any) => setter({...data, greetings: arr}), 'Greetings')}
    </>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('content.chat')}</h1><p className="text-muted text-sm mb-0">{t('content.chat.subtitle')}</p></div>
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
