'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEntityAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function CourseInfoView() {
  const { t } = useAdminLang();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('courses');
  const [course, setCourse] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    api.fetchAll().then(items => {
      const found = items.find((x: any) => x.id === id);
      if (found) setCourse(found);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) return (
    <div className="container-fluid">
      <div className="text-center py-5 text-muted"><i className="bi bi-exclamation-circle" style={{ fontSize: 48 }}></i><p className="mt-2">{t('courses.err.notFound')}</p></div>
    </div>
  );

  if (!course) return (
    <div className="container-fluid">
      <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
    </div>
  );

  const levelLabel = course.level ? `${t('courses.form.levelN')} ${course.level}` : '—';
  const statusCls = course.status === 'inactive' ? 'bg-secondary' : 'bg-success';

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 font-bold mb-1">{t('courses.info')}</h1>
          <p className="text-muted text-sm mb-0">{t('courses.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          <Link href={`/admin/courses/edit?id=${course.id}`} className="btn btn-outline-primary btn-sm"><i className="bi bi-pencil me-1"></i>{t('form.edit')}</Link>
          <Link href="/admin/courses" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-right me-1"></i>{t('form.back') || 'Back'}</Link>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="dashboard-card text-center p-4">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 96, height: 96, background: '#6366f120', color: '#6366f1' }}>
              <i className="bi bi-book" style={{ fontSize: 40 }}></i>
            </div>
            <h4 className="fw-semibold mb-1">{course.name}</h4>
            <p className="text-muted mb-1 fw-medium">{course.code}</p>
            <p className="text-muted small mb-3">{course.department}</p>
            <span className={`badge ${statusCls} mb-3`}>
              {course.status === 'inactive' ? t('status.inactive') : t('status.active')}
            </span>
            <div className="row text-center border-top pt-3 g-0">
              <div className="col-4">
                <div className="fw-bold text-primary">{course.credits || '—'}</div>
                <div className="small text-muted">{t('courses.form.credits')}</div>
              </div>
              <div className="col-4">
                <div className="fw-bold text-warning">{levelLabel}</div>
                <div className="small text-muted">{t('courses.form.level')}</div>
              </div>
              <div className="col-4">
                <div className="fw-bold text-success">{course.fee ? `${course.fee}` : '—'}</div>
                <div className="small text-muted">{t('courses.form.fee') || 'Fee'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="dashboard-card mb-3">
            <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('courses.info')}</h5></div>
            <div className="dashboard-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 150 }}>{t('courses.form.code')}</td><td className="fw-medium"><span className="badge bg-primary bg-opacity-10 text-primary">{course.code}</span></td></tr>
                  <tr><td className="text-muted">{t('courses.form.name')}</td><td className="fw-medium">{course.name}</td></tr>
                  <tr><td className="text-muted">{t('table.dept')}</td><td>{course.department || '—'}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.credits')}</td><td>{course.credits || '—'}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.level')}</td><td>{levelLabel}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.instructor')}</td><td>{course.instructor || '—'}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.fee') || 'Fee'}</td><td>{course.fee ? `${course.fee} IQD` : '—'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {course.description && (
            <div className="dashboard-card">
              <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('courses.form.desc')}</h5></div>
              <div className="dashboard-card-body">
                <p className="text-muted mb-0" style={{ lineHeight: 1.8 }}>{course.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseInfoPage() {
  return <Suspense><CourseInfoView /></Suspense>;
}
