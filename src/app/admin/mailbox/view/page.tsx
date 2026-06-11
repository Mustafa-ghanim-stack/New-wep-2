'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';

interface Contact {
  id: number; name: string; email: string; phone: string; message: string;
  date: string; read: boolean;
}

function MessageView() {
  const { t } = useAdminLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [msg, setMsg] = useState<Contact | null>(null);
  const [notFound, setNotFound] = useState(false);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || 'admin'
    : 'admin';

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    fetch(`/api/contact?token=${token}`)
      .then(r => r.json())
      .then((data: Contact[]) => {
        const found = data.find(c => c.id === parseInt(id));
        if (found) {
          setMsg(found);
          if (!found.read) {
            fetch(`/api/contact?token=${token}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: found.id }),
            });
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [id]);

  const del = async () => {
    if (!msg || !confirm('حذف هذه الرسالة؟')) return;
    await fetch(`/api/contact?token=${token}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msg.id }),
    });
    router.push('/admin/mailbox');
  };

  if (notFound) return (
    <div className="container-fluid">
      <div className="text-center py-5 text-muted">
        <i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i>
        <p className="mt-2">الرسالة غير موجودة.</p>
        <a href="/admin/mailbox" className="btn btn-outline-primary btn-sm mt-2">العودة للصندوق</a>
      </div>
    </div>
  );

  if (!msg) return (
    <div className="container-fluid">
      <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">{t('mailbox.view')}</h1>
          <p className="text-muted text-sm mb-0">{t('mailbox.subtitle')}</p>
        </div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 48, height: 48, background: '#6366f120', color: '#6366f1' }}>
              <i className="bi bi-person fs-5"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-semibold">{msg.name}</h5>
              <small className="text-muted">
                <a href={`mailto:${msg.email}`}>{msg.email}</a>
                {msg.phone && <span className="ms-2"><i className="bi bi-telephone me-1"></i>{msg.phone}</span>}
              </small>
            </div>
            <small className="ms-auto text-muted">
              {new Date(msg.date).toLocaleString('ar-IQ')}
            </small>
          </div>
          <hr />
          <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right', minHeight: 80 }}>
            {msg.message || <span className="text-muted fst-italic">لا توجد رسالة</span>}
          </div>
          <hr />
          <div className="d-flex gap-2">
            <a href={`mailto:${msg.email}`} className="btn btn-primary">
              <i className="bi bi-reply me-1"></i>رد عبر الإيميل
            </a>
            <button className="btn btn-outline-danger" onClick={del}>
              <i className="bi bi-trash me-1"></i>حذف
            </button>
            <button className="btn btn-outline-secondary" onClick={() => router.push('/admin/mailbox')}>
              <i className="bi bi-arrow-left me-1"></i>العودة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageViewPage() {
  return <Suspense><MessageView /></Suspense>;
}
