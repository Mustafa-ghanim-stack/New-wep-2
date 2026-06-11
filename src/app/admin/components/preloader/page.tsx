'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function PreloaderPage() {
  const { t } = useAdminLang();
  const [loading, setLoading] = useState(false);
  const simulateLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.preloader')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.preloader.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Spinners</h5>
            <div className="d-flex flex-wrap gap-3 mb-4">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="spinner-border text-secondary" role="status"></div>
              <div className="spinner-border text-success" role="status"></div>
              <div className="spinner-border text-danger" role="status"></div>
              <div className="spinner-border text-warning" role="status"></div>
              <div className="spinner-border text-info" role="status"></div>
            </div>
            <h5 className="fw-semibold mb-3">Growing Spinners</h5>
            <div className="d-flex flex-wrap gap-3">
              <div className="spinner-grow text-primary" role="status"></div>
              <div className="spinner-grow text-secondary" role="status"></div>
              <div className="spinner-grow text-success" role="status"></div>
              <div className="spinner-grow text-danger" role="status"></div>
              <div className="spinner-grow text-warning" role="status"></div>
              <div className="spinner-grow text-info" role="status"></div>
            </div>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Size Variations</h5>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
              <div className="spinner-border spinner-border-sm" role="status"></div>
              <div className="spinner-border" role="status"></div>
              <div className="spinner-border" style={{width:'3rem',height:'3rem'}} role="status"></div>
            </div>
            <h5 className="fw-semibold mb-3">Buttons with Spinners</h5>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled><span className="spinner-border spinner-border-sm me-1"></span>Loading...</button>
              <button className="btn btn-primary" onClick={simulateLoad} disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm me-1"></span>Loading...</> : 'Simulate Load'}</button>
            </div>
            <h5 className="fw-semibold mb-3 mt-3">Progress Bars</h5>
            <div className="progress mb-2"><div className="progress-bar" style={{width:'25%'}}>25%</div></div>
            <div className="progress mb-2"><div className="progress-bar bg-success" style={{width:'50%'}}>50%</div></div>
            <div className="progress mb-2"><div className="progress-bar bg-info" style={{width:'75%'}}>75%</div></div>
            <div className="progress"><div className="progress-bar bg-warning striped" style={{width:'100%'}}>100%</div></div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
