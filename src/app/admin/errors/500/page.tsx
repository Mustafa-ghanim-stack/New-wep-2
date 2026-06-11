'use client';
import { useRouter } from 'next/navigation';
import { useAdminLang } from '../../admin-lang-context';

export default function Error500Page() {
  const { t } = useAdminLang();
  const router = useRouter();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.errors.500')}</h1><p className="text-muted text-sm mb-0">{t('ui.errors.500.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body text-center py-5">
        <div className="display-1 fw-bold text-danger" style={{fontSize: 120, lineHeight: 1}}>500</div>
        <div className="mb-3"><i className="bi bi-exclamation-triangle text-warning" style={{fontSize: 48}}></i></div>
        <h4 className="fw-semibold mb-2">Internal Server Error</h4>
        <p className="text-muted mb-4">Something went wrong on our end. We are working to fix it. Please try again later.</p>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-primary" onClick={() => router.push('/admin')}><i className="bi bi-house me-1"></i>Go to Dashboard</button>
          <button className="btn btn-outline-secondary" onClick={() => window.location.reload()}><i className="bi bi-arrow-clockwise me-1"></i>Refresh Page</button>
        </div>
      </div></div>
    </div>
  );
}
