'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function AuthRegisterPage() {
  const { t } = useAdminLang();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { alert('Passwords do not match!'); return; }
    alert(`Account created for ${form.name}`);
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.auth.register')}</h1><p className="text-muted text-sm mb-0">{t('ui.auth.register.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3 text-center">Create Account</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="form-label text-xs text-muted">Full Name</label><input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter name" /></div>
              <div className="mb-3"><label className="form-label text-xs text-muted">Email</label><input type="email" className="form-control" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" /></div>
              <div className="mb-3"><label className="form-label text-xs text-muted">Password</label><input type="password" className="form-control" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" /></div>
              <div className="mb-3"><label className="form-label text-xs text-muted">Confirm Password</label><input type="password" className="form-control" required value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} placeholder="Repeat password" /></div>
              <div className="mb-3 form-check"><input className="form-check-input" type="checkbox" required id="terms" /><label className="form-check-label small" htmlFor="terms">I agree to the Terms & Conditions</label></div>
              <button type="submit" className="btn btn-primary w-100"><i className="bi bi-person-plus me-1"></i>Register</button>
            </form>
            <p className="text-center mt-3 small text-muted mb-0">Already have an account? <a href="#">Sign in</a></p>
          </div></div>
        </div>
      </div>
    </div>
  );
}
