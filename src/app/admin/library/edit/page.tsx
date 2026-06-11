'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';
import { useEntityAPI } from '../../components';

function EditForm() {
  const { t } = useAdminLang();
  const router = useRouter();
  const api = useEntityAPI('library');
  const id = useSearchParams().get('id');
  const [form, setForm] = useState({ title: '', author: '', type: 'book', isbn: '' });
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    api.fetchAll().then((items: any[]) => {
      const asset = items.find((a: any) => a.id === id);
      if (asset) setForm({ title: asset.title, author: asset.author, type: asset.type || 'book', isbn: asset.isbn || '' });
      else setNotFound(true);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    await api.update(id, form);
    router.push('/admin/library');
  };

  if (notFound) return (
    <div className="container-fluid">
      <div className="text-center py-5 text-muted"><i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i><p className="mt-2">{t('library.notFound')}</p></div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('library.edit')}</h1><p className="text-muted text-sm mb-0">{t('library.subtitle')}</p></div>
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

export default function EditLibraryPage() {
  return <Suspense><EditForm /></Suspense>;
}
