'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function AlertsPage() {
  const { t } = useAdminLang();
  const [showDismiss, setShowDismiss] = useState(true);
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.alerts')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.alerts.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Basic Alerts</h5>
            <div className="alert alert-primary" role="alert">A simple primary alert—check it out!</div>
            <div className="alert alert-secondary" role="alert">A simple secondary alert—check it out!</div>
            <div className="alert alert-success" role="alert">A simple success alert—check it out!</div>
            <div className="alert alert-danger" role="alert">A simple danger alert—check it out!</div>
            <div className="alert alert-warning" role="alert">A simple warning alert—check it out!</div>
            <div className="alert alert-info" role="alert">A simple info alert—check it out!</div>
            <div className="alert alert-light" role="alert">A simple light alert—check it out!</div>
            <div className="alert alert-dark" role="alert">A simple dark alert—check it out!</div>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Dismissible Alerts</h5>
            {showDismiss && <div className="alert alert-warning alert-dismissible" role="alert"><strong>Holy guacamole!</strong> You should check in on some of those fields below.<button type="button" className="btn-close" onClick={() => setShowDismiss(false)}></button></div>}
            <div className="alert alert-success alert-dismissible" role="alert"><strong>Well done!</strong> You successfully read this important alert message.<button type="button" className="btn-close" data-bs-dismiss="alert"></button></div>
            <div className="alert alert-info alert-dismissible" role="alert"><strong>Heads up!</strong> This alert needs your attention.<button type="button" className="btn-close" data-bs-dismiss="alert"></button></div>
            <hr />
            <h5 className="fw-semibold mb-3">Alerts with Icon</h5>
            <div className="alert alert-primary d-flex align-items-center"><i className="bi bi-info-circle-fill me-2"></i><div>An example alert with an icon</div></div>
            <div className="alert alert-success d-flex align-items-center"><i className="bi bi-check-circle-fill me-2"></i><div>An example success alert with an icon</div></div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
