'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function SparklinePage() {
  const { t } = useAdminLang();

  const SparkBar = ({ data, color = '#6366f1', width = 120, height = 40 }: { data: number[]; color?: string; width?: number; height?: number }) => {
    const max = Math.max(...data);
    const bw = width / data.length - 2;
    return (
      <svg width={width} height={height}>
        {data.map((v, i) => {
          const bh = (v / max) * height;
          return <rect key={i} x={i * (bw + 2)} y={height - bh} width={bw} height={bh} rx={2} fill={color} opacity={0.8} />;
        })}
      </svg>
    );
  };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.sparkline')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.sparkline.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Sparkline Bar Charts</h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center"><SparkBar data={[3,7,5,9,4,8,6,10,7,12,9,15]} color="#6366f1" /><span className="ms-2">Traffic</span><span className="ms-auto fw-semibold">1,247</span></div>
              <div className="d-flex align-items-center"><SparkBar data={[8,6,10,5,12,9,14,11,16,13,18,15]} color="#22c55e" /><span className="ms-2">Sales</span><span className="ms-auto fw-semibold">$3,420</span></div>
              <div className="d-flex align-items-center"><SparkBar data={[5,8,3,10,6,12,7,14,9,16,11,18]} color="#f59e0b" /><span className="ms-2">Leads</span><span className="ms-auto fw-semibold">84</span></div>
              <div className="d-flex align-items-center"><SparkBar data={[12,10,14,8,16,11,18,13,20,15,22,17]} color="#ef4444" /><span className="ms-2">Bounce</span><span className="ms-auto fw-semibold">3.2%</span></div>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
