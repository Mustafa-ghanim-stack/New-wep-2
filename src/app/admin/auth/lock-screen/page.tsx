'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function LockScreenPage() {
  const { t } = useAdminLang();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Screen unlocked!');
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.auth.lock')}</h1><p className="text-muted text-sm mb-0">{t('ui.auth.lock.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="dashboard-card"><div className="dashboard-card-body text-center">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=80" alt="User" className="rounded-circle mb-3" width="80" height="80" />
            <h5 className="fw-semibold mb-1">Admin User</h5>
            <p className="text-muted small mb-3">Enter your password to unlock</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
              </div>
              <button type="submit" className="btn btn-primary w-100"><i className="bi bi-unlock me-1"></i>Unlock</button>
            </form>
            <p className="mt-3 small mb-0"><a href="#"><i className="bi bi-box-arrow-in-right me-1"></i>Sign in as a different user</a></p>
          </div></div>
        </div>
      </div>
    </div>
  );
}
