'use client';
import { useEffect, useState } from 'react';
import { useAdminLang } from '../admin-lang-context';

interface Contact {
  id: number; name: string; email: string; phone: string; message: string;
  date: string; read: boolean;
}

export default function MailboxPage() {
  const { t } = useAdminLang();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || 'admin'
    : 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?token=${token}`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch { setContacts([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('حذف هذه الرسالة؟')) return;
    await fetch(`/api/contact?token=${token}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setContacts(p => p.filter(c => c.id !== id));
  };

  const unread = contacts.filter(c => !c.read).length;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">
            {t('mailbox.title')}
            {unread > 0 && <span className="badge bg-danger ms-2" style={{ fontSize: 12 }}>{unread}</span>}
          </h1>
          <p className="text-muted text-sm mb-0">{t('mailbox.subtitle')}</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}>
          <i className="bi bi-arrow-clockwise me-1"></i>تحديث
        </button>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox" style={{ fontSize: 48 }}></i>
              <p className="mt-2">لا توجد رسائل بعد</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {contacts.map(c => (
                <a key={c.id} href={`/admin/mailbox/view?id=${c.id}`}
                  className={`list-group-item list-group-item-action d-flex align-items-center p-3 ${!c.read ? 'fw-semibold' : ''}`}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{ width: 40, height: 40, background: '#6366f120', color: '#6366f1' }}>
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between">
                      <span>{c.name}</span>
                      <small className="text-muted ms-2 flex-shrink-0">
                        {new Date(c.date).toLocaleDateString('ar-IQ')}
                      </small>
                    </div>
                    <div className="text-sm text-muted">{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
                    <small className="text-muted text-truncate d-block" style={{ maxWidth: 400 }}>{c.message || '—'}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
                    {!c.read && <span className="badge bg-primary rounded-pill">جديد</span>}
                    <button className="btn btn-sm btn-outline-danger py-0 px-1" style={{ fontSize: 11 }}
                      onClick={e => del(e, c.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
