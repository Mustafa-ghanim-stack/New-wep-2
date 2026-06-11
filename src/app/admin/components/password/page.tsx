'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function PasswordPage() {
  const { t } = useAdminLang();
  const [password, setPassword] = useState('');
  
  const strength = !password ? 0 : 
    password.length < 6 ? 1 :
    password.length < 8 ? 2 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2;

  const getStrength = () => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (strength <= 1) return { label: 'Weak', color: 'bg-danger', width: '25%' };
    if (strength <= 2) return { label: 'Fair', color: 'bg-warning', width: '50%' };
    if (strength <= 3) return { label: 'Good', color: 'bg-info', width: '75%' };
    return { label: 'Strong', color: 'bg-success', width: '100%' };
  };

  const s = getStrength();

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.password')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.password.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Password Strength Meter</h5>
            <div className="mb-3">
              <label className="form-label text-xs text-muted">Enter Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} placeholder="Type your password..." />
            </div>
            {password && (
              <>
                <div className="progress mb-2" style={{height: 8}}>
                  <div className={`progress-bar ${s.color} transition`} style={{width: s.width, transition: 'all 0.3s'}}></div>
                </div>
                <small className={`fw-semibold ${s.color?.replace('bg-', 'text-')}`}>Strength: {s.label}</small>
              </>
            )}
            <ul className="mt-3 small text-muted">
              <li className={password.length >= 8 ? 'text-success' : ''}>At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? 'text-success' : ''}>Contains uppercase letter</li>
              <li className={/[0-9]/.test(password) ? 'text-success' : ''}>Contains number</li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-success' : ''}>Contains special character</li>
            </ul>
          </div></div>
        </div>
      </div>
    </div>
  );
}
