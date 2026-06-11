'use client';
import { useRouter } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';

export default function Error404Page() {
  const { t } = useAdminLang();
  const router = useRouter();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.errors.404')}</h1><p className="text-muted text-sm mb-0">{t('ui.errors.404.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body text-center py-5">
        <div className="display-1 fw-bold text-primary" style={{fontSize: 120, lineHeight: 1}}>404</div>
        <div className="mb-3"><i className="bi bi-emoji-frown text-muted" style={{fontSize: 48}}></i></div>
        <h4 className="fw-semibold mb-2">Oops! Page Not Found</h4>
        <p className="text-muted mb-4">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-primary" onClick={() => router.push('/admin')}><i className="bi bi-house me-1"></i>Go to Dashboard</button>
          <button className="btn btn-outline-secondary" onClick={() => router.back()}><i className="bi bi-arrow-left me-1"></i>Go Back</button>
        </div>
      </div></div>
    </div>
  );
}
