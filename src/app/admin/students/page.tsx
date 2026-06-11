'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAPI } from '../components';
import { useAdminLang } from '../admin-lang-context';

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const;

export default function StudentsPage() {
  const { t } = useAdminLang();
  const { fetchStudents } = useAdminAPI();
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchStudents();
    if (data?.students && Array.isArray(data.students)) setStudents(data.students);
    setLoading(false);
  };

  useEffect(() => { loadStudents(); }, []);

  const handleAction = async (id: string, action: string) => {
    const token = (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ id, action }),
    });
    loadStudents();
  };

  const filtered = filter === 'all' ? students : students.filter(s => s.status === filter);

  const filterLabel = (f: string) => {
    const map: Record<string, string> = {
      all: t('students.filter.all'),
      pending: t('students.filter.pending'),
      approved: t('students.filter.approved'),
      rejected: t('students.filter.rejected'),
    };
    return map[f] ?? f;
  };

  const statusBadge = (status: string) => {
    const cls = status === 'approved' ? 'bg-success' : status === 'pending' ? 'bg-warning' : 'bg-danger';
    const label = status === 'approved' ? t('students.status.approved') : status === 'pending' ? t('students.status.pending') : t('students.status.rejected');
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div><h1 className="h3 font-bold mb-1">{t('students.title')}</h1><p className="text-muted text-sm mb-0">{t('students.subtitle')}</p></div>
      </div>
      <div className="dashboard-card mb-3">
        <div className="dashboard-card-body">
          <div className="d-flex gap-2 mb-3 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter(f)}>
                {filterLabel(f)} ({students.filter(s => f === 'all' ? true : s.status === f).length})
              </button>
            ))}
          </div>
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('students.form.fullname')}</th>
                    <th>{t('table.email')}</th>
                    <th>{t('table.phone')}</th>
                    <th>{t('table.dept')}</th>
                    <th>{t('students.form.branch')}</th>
                    <th>{t('table.status')}</th>
                    <th>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={s.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName || '?')}&background=10b981&color=fff&size=36`} className="rounded-circle" width="36" height="36" style={{ objectFit: 'cover', flexShrink: 0 }} alt="" loading="lazy" />
                          <span className="fw-medium">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="text-muted">{s.email}</td>
                      <td className="text-muted">{s.phone}</td>
                      <td className="text-muted">{s.department}</td>
                      <td className="text-muted">{s.branch}</td>
                      <td>{statusBadge(s.status)}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Link href={`/admin/students/profile?id=${s.id}`} className="btn btn-sm btn-outline-info"><i className="bi bi-eye"></i></Link>
                          <Link href={`/admin/students/edit?id=${s.id}`} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil"></i></Link>
                          {s.status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleAction(s.id, 'approve')}>{t('students.approve')}</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleAction(s.id, 'reject')}>{t('students.reject')}</button>
                            </>
                          )}
                          {s.status !== 'pending' && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(s.id, 'delete')}>{t('students.delete')}</button>
                          )}
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
