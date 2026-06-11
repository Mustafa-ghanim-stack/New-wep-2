'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEntityAPI } from '../../components';
import { useAdminLang } from '../../admin-lang-context';

function PaymentView() {
  const { t } = useAdminLang();
  const id = useSearchParams().get('id');
  const api = useEntityAPI('courses');
  const [course, setCourse] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [fee, setFee] = useState('');
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    api.fetchAll().then(items => {
      const found = items.find((x: any) => x.id === id);
      if (found) {
        setCourse(found);
        setFee(found.fee || '');
        setDiscount(found.discount || '');
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await api.update(id!, { ...course, fee, discount });
    setSaving(false);
    setMsg('تم الحفظ');
    setTimeout(() => setMsg(''), 2000);
  };

  const feeNum = Number(fee) || 0;
  const discountNum = Number(discount) || 0;
  const total = feeNum - discountNum;

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

  return (
    <div className="container-fluid">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 font-bold mb-1">{t('courses.payment')}</h1>
          <p className="text-muted text-sm mb-0">{course.name} — {course.code}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('form.saving')}</> : <><i className="bi bi-check-lg me-1"></i>{t('form.save')}</>}
          </button>
          <Link href="/admin/courses" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-right me-1"></i>{t('form.back') || 'Back'}</Link>
        </div>
      </div>

      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <div className="row g-4">
        <div className="col-md-5">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h5 className="dashboard-card-title">{t('courses.form.fee') || 'Course Fee'}</h5></div>
            <div className="dashboard-card-body">
              <div className="mb-3">
                <label className="form-label text-xs text-muted">الرسوم الدراسية (IQD)</label>
                <input type="number" className="form-control" value={fee} onChange={e => setFee(e.target.value)} placeholder="0" />
              </div>
              <div className="mb-3">
                <label className="form-label text-xs text-muted">الخصم (IQD)</label>
                <input type="number" className="form-control" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted">الرسوم:</span>
                <span className="fw-medium">{feeNum.toLocaleString()} IQD</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted">الخصم:</span>
                <span className="fw-medium text-success">- {discountNum.toLocaleString()} IQD</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">الإجمالي:</span>
                <span className="fw-bold text-primary fs-5">{total.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h5 className="dashboard-card-title">معلومات المقرر</h5></div>
            <div className="dashboard-card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: 140 }}>{t('courses.form.code')}</td><td className="fw-medium"><span className="badge bg-primary bg-opacity-10 text-primary">{course.code}</span></td></tr>
                  <tr><td className="text-muted">{t('courses.form.name')}</td><td className="fw-medium">{course.name}</td></tr>
                  <tr><td className="text-muted">{t('table.dept')}</td><td>{course.department || '—'}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.credits')}</td><td>{course.credits || '—'}</td></tr>
                  <tr><td className="text-muted">{t('courses.form.instructor')}</td><td>{course.instructor || '—'}</td></tr>
                  <tr><td className="text-muted">الحالة</td><td><span className={`badge ${course.status === 'inactive' ? 'bg-secondary' : 'bg-success'}`}>{course.status === 'inactive' ? t('status.inactive') : t('status.active')}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePaymentPage() {
  return <Suspense><PaymentView /></Suspense>;
}
