'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function ButtonsPage() {
  const { t } = useAdminLang();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.buttons')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.buttons.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Button Colors</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-danger">Danger</button>
              <button className="btn btn-warning">Warning</button>
              <button className="btn btn-info">Info</button>
              <button className="btn btn-light">Light</button>
              <button className="btn btn-dark">Dark</button>
              <button className="btn btn-link">Link</button>
            </div>
            <h5 className="fw-semibold mb-3">Outline Buttons</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <button className="btn btn-outline-primary">Primary</button>
              <button className="btn btn-outline-secondary">Secondary</button>
              <button className="btn btn-outline-success">Success</button>
              <button className="btn btn-outline-danger">Danger</button>
              <button className="btn btn-outline-warning">Warning</button>
              <button className="btn btn-outline-info">Info</button>
              <button className="btn btn-outline-dark">Dark</button>
            </div>
            <h5 className="fw-semibold mb-3">Button Sizes</h5>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary">Default</button>
              <button className="btn btn-primary btn-sm">Small</button>
            </div>
            <h5 className="fw-semibold mb-3">With Icons</h5>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary"><i className="bi bi-star me-1"></i>Star</button>
              <button className="btn btn-success"><i className="bi bi-check-circle me-1"></i>Save</button>
              <button className="btn btn-danger"><i className="bi bi-trash me-1"></i>Delete</button>
              <button className="btn btn-info"><i className="bi bi-download me-1"></i>Download</button>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
