'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function AuthLoginPage() {
  const { t } = useAdminLang();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Login attempt with: ${email}`);
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.auth.login')}</h1><p className="text-muted text-sm mb-0">{t('ui.auth.login.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3 text-center">Sign In</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-xs text-muted">Email</label>
                <div className="input-group"><span className="input-group-text"><i className="bi bi-envelope"></i></span><input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" /></div>
              </div>
              <div className="mb-3">
                <label className="form-label text-xs text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock"></i></span>
                  <input type={showPwd ? 'text' : 'password'} className="form-control" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPwd(!showPwd)}><i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i></button>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check"><input className="form-check-input" type="checkbox" id="remember" /><label className="form-check-label small" htmlFor="remember">Remember me</label></div>
                <a href="#" className="small">Forgot password?</a>
              </div>
              <button type="submit" className="btn btn-primary w-100"><i className="bi bi-box-arrow-in-right me-1"></i>Sign In</button>
            </form>
            <p className="text-center mt-3 small text-muted mb-0">Don't have an account? <a href="#">Sign up</a></p>
          </div></div>
        </div>
      </div>
    </div>
  );
}
