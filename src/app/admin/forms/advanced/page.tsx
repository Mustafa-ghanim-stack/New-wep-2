'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function AdvancedFormsPage() {
  const { t } = useAdminLang();
  const [validated, setValidated] = useState(false);
  const [range, setRange] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    if ((e.target as HTMLFormElement).checkValidity()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.forms.advanced')}</h1><p className="text-muted text-sm mb-0">{t('ui.forms.advanced.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Form Validation</h5>
            <form noValidate onSubmit={handleSubmit} className={`${validated ? 'was-validated' : ''}`}>
              <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" required placeholder="Enter your name" /><div className="invalid-feedback">Please enter your name.</div></div>
              <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" required placeholder="email@example.com" /><div className="invalid-feedback">Please provide a valid email.</div></div>
              <div className="mb-3"><label className="form-label">Age</label><input type="number" className="form-control" required min="18" max="120" /><div className="invalid-feedback">Age must be between 18 and 120.</div></div>
              <div className="mb-3"><label className="form-label">Choose option</label><select className="form-select" required><option value="">Choose...</option><option>Option 1</option><option>Option 2</option></select><div className="invalid-feedback">Please select an option.</div></div>
              <div className="mb-3 form-check"><input type="checkbox" className="form-check-input" required id="agree" /><label className="form-check-label" htmlFor="agree">Agree to terms</label><div className="invalid-feedback">You must agree before submitting.</div></div>
              <button type="submit" className="btn btn-primary">Submit Form</button>
            </form>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Range & Switches</h5>
            <div className="mb-4">
              <label className="form-label">Range Slider: {range}</label>
              <input type="range" className="form-range" min="0" max="100" value={range} onChange={e => setRange(Number(e.target.value))} />
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Toggle Switches</label>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" role="switch" id="switch1" defaultChecked /><label className="form-check-label" htmlFor="switch1">Notifications</label></div>
              <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" role="switch" id="switch2" /><label className="form-check-label" htmlFor="switch2">Dark Mode</label></div>
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id="switch3" disabled /><label className="form-check-label" htmlFor="switch3">Disabled</label></div>
            </div>
            <hr />
            <h5 className="fw-semibold mb-3">Input Sizing</h5>
            <input className="form-control form-control-lg mb-2" type="text" placeholder="Large input" />
            <input className="form-control mb-2" type="text" placeholder="Default input" />
            <input className="form-control form-control-sm" type="text" placeholder="Small input" />
          </div></div>
        </div>
      </div>
    </div>
  );
}
