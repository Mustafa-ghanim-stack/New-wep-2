'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function ModalsPage() {
  const { t } = useAdminLang();
  const [modal, setModal] = useState<string | null>(null);
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.modals')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.modals.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Modal Examples</h5>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={() => setModal('basic')}>Basic Modal</button>
              <button className="btn btn-success" onClick={() => setModal('scrolling')}>Scrolling Modal</button>
              <button className="btn btn-warning" onClick={() => setModal('centered')}>Centered Modal</button>
              <button className="btn btn-danger" onClick={() => setModal('small')}>Small Modal</button>
              <button className="btn btn-info" onClick={() => setModal('large')}>Large Modal</button>
            </div>
          </div></div>
        </div>
      </div>

      {modal === 'basic' && <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Basic Modal</h5><button type="button" className="btn-close" onClick={() => setModal(null)}></button></div>
          <div className="modal-body"><p>Modal body text goes here.</p></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button><button className="btn btn-primary">Save changes</button></div>
        </div></div>
      </div>}
      {modal === 'scrolling' && <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-dialog-scrollable"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Scrolling Modal</h5><button type="button" className="btn-close" onClick={() => setModal(null)}></button></div>
          <div className="modal-body"><p>Scrolling content...</p>{Array.from({length:20}).map((_,i)=> <p key={i}>Paragraph {i+1} - This is scrolling content within the modal body. Keep scrolling to see more.</p>)}</div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button></div>
        </div></div>
      </div>}
      {modal === 'centered' && <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Centered Modal</h5><button type="button" className="btn-close" onClick={() => setModal(null)}></button></div>
          <div className="modal-body"><p>This modal is vertically centered.</p></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button></div>
        </div></div>
      </div>}
      {modal === 'small' && <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-sm"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Small Modal</h5><button type="button" className="btn-close" onClick={() => setModal(null)}></button></div>
          <div className="modal-body"><p>Small modal body.</p></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button></div>
        </div></div>
      </div>}
      {modal === 'large' && <div className="modal d-block" tabIndex={-1} style={{background:'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-lg"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Large Modal</h5><button type="button" className="btn-close" onClick={() => setModal(null)}></button></div>
          <div className="modal-body"><p>Large modal body with extra space.</p></div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setModal(null)}>Close</button></div>
        </div></div>
      </div>}
    </div>
  );
}
