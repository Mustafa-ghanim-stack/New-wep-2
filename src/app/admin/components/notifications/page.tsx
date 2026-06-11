'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function NotificationsPage() {
  const { t } = useAdminLang();
  const showToast = () => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast show align-items-center text-bg-primary border-0';
    toast.role = 'alert';
    toast.innerHTML = `<div class="d-flex"><div class="toast-body">Hello! This is a toast notification.</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.notifications')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.notifications.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Toast Notifications</h5>
            <button className="btn btn-primary" onClick={showToast}>Show Toast</button>
            <div id="toastContainer" className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 9999}}></div>
            <hr />
            <h5 className="fw-semibold mb-3">Static Toast</h5>
            <div className="toast show" role="alert">
              <div className="toast-header"><strong className="me-auto">Notification</strong><small>1 min ago</small><button type="button" className="btn-close" data-bs-dismiss="toast"></button></div>
              <div className="toast-body">Hello! This is a static toast message.</div>
            </div>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Badge Notifications</h5>
            <div className="d-flex flex-wrap gap-4 align-items-center">
              <div className="position-relative"><i className="bi bi-envelope fs-2"></i><span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">4</span></div>
              <div className="position-relative"><i className="bi bi-bell fs-2"></i><span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">8</span></div>
              <div className="position-relative"><i className="bi bi-chat-dots fs-2"></i><span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">3</span></div>
            </div>
            <hr />
            <h5 className="fw-semibold mb-3">Pill Badges</h5>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge rounded-pill bg-primary">Primary</span>
              <span className="badge rounded-pill bg-secondary">Secondary</span>
              <span className="badge rounded-pill bg-success">Success</span>
              <span className="badge rounded-pill bg-danger">Danger</span>
              <span className="badge rounded-pill bg-warning text-dark">Warning</span>
              <span className="badge rounded-pill bg-info">Info</span>
              <span className="badge rounded-pill bg-dark">Dark</span>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
