'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';

function ProfileView() {
  const { t } = useAdminLang();
  const id = useSearchParams().get('id');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    const token = (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
    fetch(`/api/students?token=${token}`)
      .then(r => r.json())
      .then(d => {
        const found = d.students?.find((s: any) => String(s.id) === id);
        if (found) setStudent(found);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return <div className="container-fluid text-center py-5"><div className="spinner-border text-primary"></div></div>;

  if (notFound) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5 text-muted"><i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i><p className="mt-2">{t('students.notFound')}</p></div>
      </div>
    );
  }

  const statusCls = student.status === 'approved' ? 'bg-success' : student.status === 'pending' ? 'bg-warning' : 'bg-danger';
  const statusLabel = student.status === 'approved' ? t('students.status.approved') : student.status === 'pending' ? t('students.status.pending') : t('students.status.rejected');

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('students.profile')}</h1><p className="text-muted text-sm mb-0">{t('students.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="dashboard-card text-center p-4">
            <img src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName)}&background=10b981&color=fff&size=96`} alt={student.fullName} className="rounded-circle mb-3" width="96" height="96" style={{ objectFit: 'cover' }} />
            <h4 className="fw-semibold mb-1">{student.fullName}</h4>
            <p className="text-muted mb-1">{student.department}</p>
            <p className="text-muted small mb-3">{student.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <span className={`badge ${statusCls} fs-6 px-3 py-2`}>{statusLabel}</span>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('students.profile')}</h5></div>
            <div className="dashboard-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 160 }}>{t('students.form.fullname')}</td><td className="fw-medium">{student.fullName}</td></tr>
                  <tr><td className="text-muted">{t('table.email')}</td><td>{student.email}</td></tr>
                  <tr><td className="text-muted">{t('table.phone')}</td><td>{student.phone || '—'}</td></tr>
                  <tr><td className="text-muted">{t('table.dept')}</td><td>{student.department || '—'}</td></tr>
                  <tr><td className="text-muted">{t('students.form.branch')}</td><td>{student.branch || '—'}</td></tr>
                  <tr><td className="text-muted">{t('table.status')}</td><td><span className={`badge ${statusCls}`}>{statusLabel}</span></td></tr>
                  <tr><td className="text-muted">{t('students.registered')}</td><td>{new Date(student.createdAt).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  return <Suspense><ProfileView /></Suspense>;
}
