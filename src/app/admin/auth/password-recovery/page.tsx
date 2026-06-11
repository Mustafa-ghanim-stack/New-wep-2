'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function PasswordRecoveryPage() {
  const { t } = useAdminLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.auth.recovery')}</h1><p className="text-muted text-sm mb-0">{t('ui.auth.recovery.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3 text-center">Reset Password</h5>
            {sent ? (
              <div className="text-center py-3">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width:64,height:64,background:'#22c55e20',color:'#22c55e'}}>
                  <i className="bi bi-check-lg" style={{fontSize:28}}></i>
                </div>
                <h6 className="fw-semibold">Email Sent!</h6>
                <p className="small text-muted mb-0">Password reset instructions have been sent to <strong>{email}</strong></p>
                <button className="btn btn-outline-primary btn-sm mt-3" onClick={() => setSent(false)}>Send again</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="small text-muted mb-3">Enter your email and we'll send you a link to reset your password.</p>
                <div className="mb-3"><label className="form-label text-xs text-muted">Email</label><div className="input-group"><span className="input-group-text"><i className="bi bi-envelope"></i></span><input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" /></div></div>
                <button type="submit" className="btn btn-primary w-100"><i className="bi bi-send me-1"></i>Send Reset Link</button>
                <p className="text-center mt-3 small mb-0"><a href="#"><i className="bi bi-arrow-left me-1"></i>Back to login</a></p>
              </form>
            )}
          </div></div>
        </div>
      </div>
    </div>
  );
}
