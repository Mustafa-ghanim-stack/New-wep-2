'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useEntityAPI } from '../components';
import { useAdminLang } from '../admin-lang-context';

export default function DepartmentsPage() {
  const { t } = useAdminLang();
  const api = useEntityAPI('departments');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await api.fetchAll()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('departments.delete.confirm'))) return;
    await api.remove(id); load();
  };

  const filtered = items.filter(d =>
    !search ||
    d.nameAr?.toLowerCase().includes(search.toLowerCase()) ||
    d.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase()) ||
    d.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('departments.title')}</h1><p className="text-muted text-sm mb-0">{t('departments.subtitle')}</p></div>
        <Link href="/admin/departments/add" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>{t('departments.add')}</Link>
      </div>

      <div className="row g-3 mb-3">
        {[
          { label: 'إجمالي الأقسام', value: items.length, icon: 'building', color: '#6366f1' },
          { label: 'أقسام نشطة', value: items.filter(d => d.status !== 'inactive').length, icon: 'check-circle', color: '#10b981' },
          { label: 'لديها دوام مسائي', value: items.filter(d => d.evening && d.evening !== '0').length, icon: 'moon', color: '#f59e0b' },
          { label: 'بدون رئيس قسم', value: items.filter(d => !d.head).length, icon: 'person-dash', color: '#ef4444' },
        ].map(s => (
          <div className="col-md-3" key={s.label}>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-center">
                <div><div className="stats-card-label">{s.label}</div><div className="stats-card-value">{s.value}</div></div>
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
            <input className="form-control" placeholder="بحث بالاسم أو الكود أو المعرف..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border"></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted"><i className="bi bi-building" style={{ fontSize: 48 }}></i><p className="mt-2">{t('departments.empty')}</p></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>الكود</th>
                    <th>الاسم</th>
                    <th>الفرع</th>
                    <th>الصباحي</th>
                    <th>المسائي</th>
                    <th>الحالة</th>
                    <th>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d: any) => (
                    <tr key={d.id}>
                      <td>
                        {d.img
                          ? <img src={d.img} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                          : <div style={{ width: 48, height: 32, background: '#f1f5f9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-building text-muted small"></i></div>
                        }
                      </td>
                      <td><span className="badge bg-primary bg-opacity-10 text-primary fw-medium">{d.code || '—'}</span></td>
                      <td>
                        <div className="fw-medium">{d.nameAr || d.name || '—'}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{d.nameEn || ''}</div>
                      </td>
                      <td><span className="badge bg-secondary bg-opacity-10 text-secondary">{d.branchAr || '—'}</span></td>
                      <td>
                        {d.morning && d.morning !== '0'
                          ? <><div className="fw-medium text-primary" style={{ fontSize: '0.82rem' }}>{d.morning} IQD</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.morningRate}</div></>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td>
                        {d.evening && d.evening !== '0'
                          ? <><div className="fw-medium text-warning" style={{ fontSize: '0.82rem' }}>{d.evening} IQD</div><div className="text-muted" style={{ fontSize: '0.75rem' }}>{d.eveningRate}</div></>
                          : <span className="text-muted text-xs">لا يوجد</span>
                        }
                      </td>
                      <td><span className={`badge ${d.status === 'inactive' ? 'bg-secondary' : 'bg-success'}`}>{d.status === 'inactive' ? 'غير نشط' : 'نشط'}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/admin/departments/edit?id=${d.id}`} className="btn btn-sm btn-outline-primary" title="تعديل"><i className="bi bi-pencil"></i></Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)} title="حذف"><i className="bi bi-trash"></i></button>
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
