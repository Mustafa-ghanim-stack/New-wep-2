'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function BasicFormsPage() {
  const { t } = useAdminLang();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.forms.basic')}</h1><p className="text-muted text-sm mb-0">{t('ui.forms.basic.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Input Types</h5>
            <div className="mb-3"><label className="form-label">Text Input</label><input type="text" className="form-control" placeholder="Enter text" /></div>
            <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" placeholder="email@example.com" /></div>
            <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" placeholder="Password" /></div>
            <div className="mb-3"><label className="form-label">Number</label><input type="number" className="form-control" placeholder="0" /></div>
            <div className="mb-3"><label className="form-label">Textarea</label><textarea className="form-control" rows={3} placeholder="Write something..."></textarea></div>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Select & Checkbox</h5>
            <div className="mb-3"><label className="form-label">Select</label><select className="form-select"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select></div>
            <div className="mb-3"><label className="form-label">Multiple Select</label><select className="form-select" multiple><option>Option 1</option><option>Option 2</option><option>Option 3</option><option>Option 4</option></select></div>
            <div className="mb-3">
              <label className="form-label d-block">Checkboxes</label>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="c1" /><label className="form-check-label" htmlFor="c1">Default checkbox</label></div>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="c2" defaultChecked /><label className="form-check-label" htmlFor="c2">Checked checkbox</label></div>
              <div className="form-check"><input className="form-check-input" type="checkbox" id="c3" disabled /><label className="form-check-label" htmlFor="c3">Disabled checkbox</label></div>
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Radios</label>
              <div className="form-check"><input className="form-check-input" type="radio" name="radio" id="r1" /><label className="form-check-label" htmlFor="r1">Radio option 1</label></div>
              <div className="form-check"><input className="form-check-input" type="radio" name="radio" id="r2" defaultChecked /><label className="form-check-label" htmlFor="r2">Radio option 2</label></div>
            </div>
          </div></div>
        </div>
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Input Groups</h5>
            <div className="row g-3">
              <div className="col-md-4"><div className="input-group"><span className="input-group-text">@</span><input type="text" className="form-control" placeholder="Username" /></div></div>
              <div className="col-md-4"><div className="input-group"><input type="text" className="form-control" placeholder="Amount" /><span className="input-group-text">$</span></div></div>
              <div className="col-md-4"><div className="input-group"><span className="input-group-text"><i className="bi bi-envelope"></i></span><input type="email" className="form-control" placeholder="Email" /></div></div>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
