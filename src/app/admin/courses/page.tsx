'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEntityAPI } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function CoursesPage() {
  const { t } = useAdminLang();
  const api = useEntityAPI('courses');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await api.fetchAll()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('courses.delete.confirm'))) return;
    await api.remove(id); load();
  };

  const filtered = items.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('courses.title')}</h1><p className="text-muted text-sm mb-0">{t('courses.subtitle')}</p></div>
        <Link href="/admin/courses/add" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>{t('courses.add')}</Link>
      </div>

      <div className="row g-3 mb-3">
        {[
          { labelKey: 'courses.stat.total', value: items.length, icon: 'book', color: '#6366f1' },
          { labelKey: 'courses.stat.depts', value: [...new Set(items.map(c => c.department).filter(Boolean))].length, icon: 'building', color: '#10b981' },
          { labelKey: 'courses.stat.hours', value: items.reduce((sum, c) => sum + (Number(c.credits) || 0), 0), icon: 'clock', color: '#f59e0b' },
          { labelKey: 'courses.stat.active', value: items.filter(c => c.status !== 'inactive').length, icon: 'check-circle', color: '#06b6d4' },
        ].map(s => (
          <div className="col-md-3" key={s.labelKey}>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-center">
                <div><div className="stats-card-label">{t(s.labelKey)}</div><div className="stats-card-value">{s.value}</div></div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 44, height: 44, background: `${s.color}20` }}>
                  <i className={`bi bi-${s.icon}`} style={{ color: s.color, fontSize: 20 }}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-body">
          <div className="d-flex gap-2 mb-3">
            <input className="form-control" placeholder={t('courses.search')} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted"><i className="bi bi-book" style={{ fontSize: 48 }}></i><p className="mt-2">{t('courses.empty')}</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead><tr><th>{t('table.code')}</th><th>{t('table.name')}</th><th>{t('table.dept')}</th><th>{t('table.credits')}</th><th>{t('table.status')}</th><th>{t('table.actions')}</th></tr></thead>
                <tbody>
                  {filtered.map((c: any) => (
                    <tr key={c.id}>
                      <td><span className="badge bg-primary bg-opacity-10 text-primary fw-medium">{c.code}</span></td>
                      <td className="fw-medium">{c.name}</td>
                      <td className="text-muted">{c.department}</td>
                      <td>{c.credits}</td>
                      <td><span className={`badge ${c.status === 'inactive' ? 'bg-secondary' : 'bg-success'}`}>{c.status === 'inactive' ? t('status.inactive') : t('status.active')}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/admin/courses/info?id=${c.id}`} className="btn btn-sm btn-outline-info"><i className="bi bi-eye"></i></Link>
                          <Link href={`/admin/courses/payment?id=${c.id}`} className="btn btn-sm btn-outline-success"><i className="bi bi-cash"></i></Link>
                          <Link href={`/admin/courses/edit?id=${c.id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}><i className="bi bi-trash"></i></button>
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
