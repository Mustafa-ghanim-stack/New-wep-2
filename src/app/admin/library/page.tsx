'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminLang } from '../admin-lang-context';
import { useEntityAPI } from '../components';

export default function LibraryPage() {
  const { t } = useAdminLang();
  const api = useEntityAPI('library');
  const [assets, setAssets] = useState<any[]>([]);

  const load = async () => setAssets(await api.fetchAll());
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => { await api.remove(id); load(); };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      book: t('library.type.book'), journal: t('library.type.journal'),
      digital: t('library.type.digital'), thesis: t('library.type.thesis'),
    };
    return map[type] ?? type;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('library.title')}</h1><p className="text-muted text-sm mb-0">{t('library.subtitle')}</p></div>
        <Link href="/admin/library/add" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>{t('library.add')}</Link>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-body">
          {assets.length === 0 ? (
            <div className="text-center py-5 text-muted"><i className="bi bi-journal" style={{ fontSize: 48 }}></i><p className="mt-2">{t('library.empty')}</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('library.form.title')}</th>
                    <th>{t('library.form.author')}</th>
                    <th>{t('library.form.type')}</th>
                    <th>{t('library.form.isbn')}</th>
                    <th>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a: any) => (
                    <tr key={a.id}>
                      <td className="fw-medium">{a.title}</td>
                      <td className="text-muted">{a.author}</td>
                      <td><span className="badge bg-info">{typeLabel(a.type)}</span></td>
                      <td className="text-muted">{a.isbn}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/admin/library/edit?id=${a.id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a.id)}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
