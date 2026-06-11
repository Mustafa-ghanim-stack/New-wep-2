'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function DataMapsPage() {
  const { t } = useAdminLang();

  const regions = [
    { name: 'North America', value: 580, color: '#6366f1' },
    { name: 'South America', value: 230, color: '#22c55e' },
    { name: 'Europe', value: 420, color: '#f59e0b' },
    { name: 'Africa', value: 180, color: '#ef4444' },
    { name: 'Asia', value: 650, color: '#06b6d4' },
    { name: 'Australia', value: 120, color: '#a855f7' },
  ];
  const maxVal = Math.max(...regions.map(r => r.value));

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.datamaps')}</h1><p className="text-muted text-sm mb-0">{t('ui.dev.datamaps.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-7">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">World Map Visualization</h5>
            <div className="position-relative" style={{minHeight: 350}}>
              <svg viewBox="0 0 800 400" className="w-100">
                <rect x="50" y="100" width="160" height="120" rx="8" fill="#6366f1" opacity={0.7 + regions[0].value / maxVal * 0.3} />
                <rect x="60" y="110" width="50" height="30" rx="4" fill="#6366f1" opacity={0.5} />
                <rect x="50" y="250" width="100" height="80" rx="8" fill="#22c55e" opacity={0.7 + regions[1].value / maxVal * 0.3} />
                <rect x="280" y="80" width="120" height="100" rx="8" fill="#f59e0b" opacity={0.7 + regions[2].value / maxVal * 0.3} />
                <rect x="270" y="220" width="100" height="120" rx="8" fill="#ef4444" opacity={0.7 + regions[3].value / maxVal * 0.3} />
                <rect x="540" y="80" width="190" height="150" rx="8" fill="#06b6d4" opacity={0.7 + regions[4].value / maxVal * 0.3} />
                <rect x="580" y="260" width="100" height="70" rx="8" fill="#a855f7" opacity={0.7 + regions[5].value / maxVal * 0.3} />
                <text x="400" y="50" textAnchor="middle" fill="#6b7280" fontSize="14">World Map - Regional Data Distribution (Simplified)</text>
              </svg>
            </div>
          </div></div>
        </div>
        <div className="col-md-5">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Regional Data</h5>
            {regions.map((r, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small"><span className="d-inline-block rounded-circle me-1" style={{width:10,height:10,background:r.color}}></span>{r.name}</span>
                  <span className="fw-semibold small">{r.value}k</span>
                </div>
                <div className="progress" style={{height:6}}>
                  <div className="progress-bar" style={{width:`${(r.value / maxVal) * 100}%`, background:r.color}}></div>
                </div>
              </div>
            ))}
            <hr />
            <p className="small text-muted mb-0">Total: 2,180k visitors across all regions</p>
          </div></div>
        </div>
      </div>
    </div>
  );
}
