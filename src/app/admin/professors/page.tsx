'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEntityAPI } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function ProfessorsPage() {
  const { t } = useAdminLang();
  const api = useEntityAPI('professors');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await api.fetchAll()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('professors.delete.confirm') || 'Delete this professor?')) return;
    await api.remove(id); load();
  };

  const filtered = items.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('professors.title')}</h1><p className="text-muted text-sm mb-0">{t('professors.subtitle')}</p></div>
        <Link href="/admin/professors/add" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>{t('professors.add')}</Link>
      </div>

      <div className="row g-3 mb-3">
        {[
          { labelKey: 'professors.stat.total', value: items.length, icon: 'people', color: '#6366f1' },
          { labelKey: 'professors.stat.fulltime', value: items.filter(p => p.type === 'full').length, icon: 'person-check', color: '#10b981' },
          { labelKey: 'professors.stat.parttime', value: items.filter(p => p.type === 'part').length, icon: 'person-dash', color: '#f59e0b' },
          { labelKey: 'professors.stat.depts', value: [...new Set(items.map(p => p.department).filter(Boolean))].length, icon: 'building', color: '#06b6d4' },
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
            <input className="form-control" placeholder={t('professors.search')} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted"><i className="bi bi-person-badge" style={{ fontSize: 48 }}></i><p className="mt-2">{t('professors.empty')}</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead><tr><th>{t('table.name')}</th><th>{t('table.dept')}</th><th>{t('table.email')}</th><th>{t('table.phone')}</th><th>{t('table.type')}</th><th>{t('table.actions')}</th></tr></thead>
                <tbody>
                  {filtered.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || '?')}&background=6366f1&color=fff&size=36`} className="rounded-circle" width="36" height="36" style={{ objectFit: 'cover' }} alt="" loading="lazy" />
                          <span className="fw-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{p.department}</td>
                      <td className="text-muted">{p.email}</td>
                      <td className="text-muted">{p.phone}</td>
                      <td><span className={`badge ${p.type === 'full' ? 'bg-success' : 'bg-warning text-dark'}`}>{p.type === 'full' ? t('status.fulltime') : t('status.parttime')}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/admin/professors/profile?id=${p.id}`} className="btn btn-sm btn-outline-info"><i className="bi bi-eye"></i></Link>
                          <Link href={`/admin/professors/edit?id=${p.id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}><i className="bi bi-trash"></i></button>
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
