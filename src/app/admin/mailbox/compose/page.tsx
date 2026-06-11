'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';

export default function ComposePage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const [form, setForm] = useState({ to: '', subject: '', body: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('admin_messages');
    const messages = stored ? JSON.parse(stored) : [];
    messages.unshift({
      from: 'Me',
      subject: form.subject,
      date: 'Just now',
      preview: form.body.slice(0, 60),
      read: true,
      to: form.to,
      body: form.body,
    });
    localStorage.setItem('admin_messages', JSON.stringify(messages));
    router.push('/admin/mailbox');
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('mailbox.compose')}</h1><p className="text-muted text-sm mb-0">{t('mailbox.subtitle')}</p></div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-xs text-muted">To</label>
              <input className="form-control" required value={form.to} onChange={e => setForm({...form, to: e.target.value})} placeholder="recipient@example.com" />
            </div>
            <div className="mb-3">
              <label className="form-label text-xs text-muted">Subject</label>
              <input className="form-control" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Enter subject" />
            </div>
            <div className="mb-3">
              <label className="form-label text-xs text-muted">Message</label>
              <textarea className="form-control" rows={8} required value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Write your message here..."></textarea>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary"><i className="bi bi-send me-1"></i>Send</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>Discard</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
