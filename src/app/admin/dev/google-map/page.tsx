'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function GoogleMapPage() {
  const { t } = useAdminLang();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.googlemap')}</h1><p className="text-muted text-sm mb-0">{t('ui.dev.googlemap.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Interactive Map</h5>
            <div className="border rounded" style={{height: 450}}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.305935303!2d-74.25986548248684!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2s!4v1"
                className="w-100 h-100 border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
              />
            </div>
            <div className="mt-3">
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label text-xs text-muted">Latitude</label><input className="form-control" defaultValue="40.7128" /></div>
                <div className="col-md-4"><label className="form-label text-xs text-muted">Longitude</label><input className="form-control" defaultValue="-74.0060" /></div>
                <div className="col-md-4"><label className="form-label text-xs text-muted">Zoom</label><select className="form-select" defaultValue="12"><option>10</option><option>12</option><option>14</option><option>16</option></select></div>
              </div>
              <button className="btn btn-primary mt-3"><i className="bi bi-geo-alt me-1"></i>Update Map</button>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
