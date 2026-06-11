'use client';
import { useEffect, useState } from 'react';

interface Contact {
  id: number; name: string; email: string; phone: string; message: string;
  date: string; read: boolean;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    : '';

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/contact?token=${token}`);
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/contact?token=${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setContacts(p => p.map(c => c.id === id ? { ...c, read: true } : c));
  };

  const del = async (id: number) => {
    if (!confirm('حذف هذه الرسالة؟')) return;
    await fetch(`/api/contact?token=${token}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setContacts(p => p.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const open = (c: Contact) => {
    setSelected(c);
    if (!c.read) markRead(c.id);
  };

  const unread = contacts.filter(c => !c.read).length;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">رسائل التواصل</h1>
          <p className="text-muted text-sm mb-0">
            {unread > 0 ? <span className="badge bg-danger me-2">{unread} غير مقروءة</span> : null}
            إجمالي: {contacts.length} رسالة
          </p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}><i className="bi bi-arrow-clockwise me-1"></i>تحديث</button>
      </div>

      {loading ? (
        <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
      ) : contacts.length === 0 ? (
        <div className="alert alert-info">لا توجد رسائل بعد</div>
      ) : (
        <div className="row g-3">
          <div className={selected ? 'col-md-5' : 'col-12'}>
            <div className="list-group">
              {contacts.map(c => (
                <button key={c.id} onClick={() => open(c)}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start py-3 ${selected?.id === c.id ? 'active' : ''} ${!c.read ? 'fw-bold' : ''}`}>
                  <div className="me-2 text-start" style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {!c.read && <span className="badge bg-primary" style={{ fontSize: 9 }}>جديد</span>}
                      <span style={{ fontSize: 14 }}>{c.name}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>{c.email}</div>
                    {c.message && <div className="text-truncate text-muted" style={{ fontSize: 11, maxWidth: 220 }}>{c.message}</div>}
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <small className="text-muted" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                      {new Date(c.date).toLocaleDateString('ar-IQ')}
                    </small>
                    <button className="btn btn-sm btn-outline-danger py-0 px-1" style={{ fontSize: 11 }}
                      onClick={e => { e.stopPropagation(); del(c.id); }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="col-md-7">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{selected.name}</h6>
                  <button className="btn-close btn-sm" onClick={() => setSelected(null)}></button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex gap-3 flex-wrap mb-2">
                      <span><i className="bi bi-envelope me-1 text-primary"></i><a href={`mailto:${selected.email}`}>{selected.email}</a></span>
                      {selected.phone && <span><i className="bi bi-telephone me-1 text-success"></i>{selected.phone}</span>}
                    </div>
                    <small className="text-muted"><i className="bi bi-clock me-1"></i>{new Date(selected.date).toLocaleString('ar-IQ')}</small>
                  </div>
                  {selected.message ? (
                    <div className="p-3 bg-light rounded-3" style={{ whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right' }}>
                      {selected.message}
                    </div>
                  ) : (
                    <p className="text-muted fst-italic">لا توجد رسالة</p>
                  )}
                  <div className="mt-3 d-flex gap-2">
                    <a href={`mailto:${selected.email}`} className="btn btn-primary btn-sm">
                      <i className="bi bi-reply me-1"></i>رد عبر الإيميل
                    </a>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => del(selected.id)}>
                      <i className="bi bi-trash me-1"></i>حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
