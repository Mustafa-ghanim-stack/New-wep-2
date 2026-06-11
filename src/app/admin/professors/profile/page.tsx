'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEntityAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function ProfileView() {
  const { t } = useAdminLang();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('professors');
  const [prof, setProf] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    api.fetchAll().then(items => {
      const found = items.find((x: any) => x.id === id);
      if (found) setProf(found); else setNotFound(true);
    });
  }, [id]);

  if (notFound) return <div className="container-fluid text-center py-5 text-muted"><i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i><p className="mt-2">{t('professors.err.notFound')}</p></div>;
  if (!prof) return <div className="container-fluid text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h1 className="h3 font-bold mb-0">{t('professors.profile')}</h1>
        <Link href={`/admin/professors/edit?id=${prof.id}`} className="btn btn-outline-primary btn-sm"><i className="bi bi-pencil me-1"></i>{t('form.edit')}</Link>
      </div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="dashboard-card text-center p-4">
            <img src={prof.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name || '?')}&background=6366f1&color=fff&size=96`} className="rounded-circle mb-3" width="96" height="96" style={{ objectFit: 'cover' }} alt={prof.name} />
            <h4 className="fw-semibold mb-1">{prof.name}</h4>
            <p className="text-muted mb-1">{prof.position ? t(`professors.rank.${prof.position}`) : t('professors.detail.position')}</p>
            <p className="text-muted small mb-3">{prof.department}</p>
            <span className={`badge ${prof.status === 'active' ? 'bg-success' : 'bg-secondary'} mb-3`}>
              {prof.status === 'active' ? t('status.active') : t('status.inactive')}
            </span>
            <div className="d-flex justify-content-center gap-3 mt-2">
              {prof.facebook && <a href={prof.facebook} target="_blank" className="text-muted"><i className="bi bi-facebook"></i></a>}
              {prof.linkedin && <a href={prof.linkedin} target="_blank" className="text-muted"><i className="bi bi-linkedin"></i></a>}
              {prof.twitter && <a href={prof.twitter} target="_blank" className="text-muted"><i className="bi bi-twitter-x"></i></a>}
              {prof.instagram && <a href={prof.instagram} target="_blank" className="text-muted"><i className="bi bi-instagram"></i></a>}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('professors.detail.info')}</h5></div>
            <div className="dashboard-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 150 }}>{t('table.name')}</td><td className="fw-medium">{prof.name}</td></tr>
                  <tr><td className="text-muted">{t('table.email')}</td><td>{prof.email}</td></tr>
                  <tr><td className="text-muted">{t('table.phone')}</td><td>{prof.phone || '—'}</td></tr>
                  <tr><td className="text-muted">{t('table.dept')}</td><td>{prof.department || '—'}</td></tr>
                  <tr><td className="text-muted">{t('professors.form.position')}</td><td>{prof.position ? t(`professors.rank.${prof.position}`) : '—'}</td></tr>
                  <tr><td className="text-muted">{t('professors.form.type')}</td><td>{prof.type === 'full' ? t('status.fulltime') : t('status.parttime')}</td></tr>
                  <tr><td className="text-muted">{t('professors.form.dob')}</td><td>{prof.dob || '—'}</td></tr>
                  <tr><td className="text-muted">{t('professors.form.gender')}</td><td>{prof.gender === 'male' ? t('status.male') : prof.gender === 'female' ? t('status.female') : '—'}</td></tr>
                  <tr><td className="text-muted">{t('professors.form.address')}</td><td>{prof.address || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ProfessorProfilePage() { return <Suspense><ProfileView /></Suspense>; }
