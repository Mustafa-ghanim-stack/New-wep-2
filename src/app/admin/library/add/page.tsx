'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';
import { useEntityAPI } from '../../components';

export default function AddLibraryPage() {
  const { t } = useAdminLang();
  const router = useRouter();
  const api = useEntityAPI('library');
  const [form, setForm] = useState({ title: '', author: '', type: 'book', isbn: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.add(form);
    router.push('/admin/library');
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('library.add')}</h1><p className="text-muted text-sm mb-0">{t('library.subtitle')}</p></div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('library.form.title')}</label><input className="form-control" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('library.form.author')}</label><input className="form-control" required value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div>
              <div className="col-md-6">
                <label className="form-label text-xs text-muted">{t('library.form.type')}</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="book">{t('library.type.book')}</option>
                  <option value="journal">{t('library.type.journal')}</option>
                  <option value="digital">{t('library.type.digital')}</option>
                  <option value="thesis">{t('library.type.thesis')}</option>
                </select>
              </div>
              <div className="col-md-6"><label className="form-label text-xs text-muted">{t('library.form.isbn')}</label><input className="form-control" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} /></div>
            </div>
            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}><i className="bi bi-check-lg me-1"></i>{saving ? t('form.saving') : t('form.save')}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>{t('form.cancel')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
