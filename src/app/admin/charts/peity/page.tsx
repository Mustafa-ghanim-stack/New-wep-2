'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function PeityPage() {
  const { t } = useAdminLang();

  const MiniChart = ({ data, color, width = 80, height = 30 }: { data: number[]; color: string; width?: number; height?: number }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} className="me-2">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        {data.slice(-1).map((v, i) => (
          <circle key={i} cx={width} cy={height - ((v - min) / range) * (height - 4) - 2} r="3" fill={color} />
        ))}
      </svg>
    );
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.peity')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.peity.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Mini Line Charts</h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center"><MiniChart data={[5,8,6,12,9,15,11,18]} color="#6366f1" /><span>Users</span><span className="ms-auto fw-semibold text-primary">+18%</span></div>
              <div className="d-flex align-items-center"><MiniChart data={[20,18,22,25,19,28,24,30]} color="#22c55e" /><span>Revenue</span><span className="ms-auto fw-semibold text-success">+30%</span></div>
              <div className="d-flex align-items-center"><MiniChart data={[12,9,15,11,8,14,10,16]} color="#f59e0b" /><span>Orders</span><span className="ms-auto fw-semibold text-warning">+16%</span></div>
              <div className="d-flex align-items-center"><MiniChart data={[8,6,10,7,12,9,14,11]} color="#ef4444" /><span>Visitors</span><span className="ms-auto fw-semibold text-danger">+11%</span></div>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
