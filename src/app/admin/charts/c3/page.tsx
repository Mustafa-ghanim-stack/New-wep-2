'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function C3Page() {
  const { t } = useAdminLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const w = canvasRef.current.width, h = canvasRef.current.height;
    const cx = w / 2, cy = h / 1.5, r = Math.min(cx, cy) - 40;
    const data = [35, 25, 20, 15, 5];
    const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'];
    const labels = ['Students','Professors','Courses','Staff','Others'];
    ctx.clearRect(0, 0, w, h);
    let startAngle = -Math.PI / 2;
    data.forEach((v, i) => {
      const sliceAngle = (v / 100) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle); ctx.closePath();
      ctx.fillStyle = colors[i]; ctx.fill();
      const midAngle = startAngle + sliceAngle / 2;
      const lx = cx + Math.cos(midAngle) * (r + 20);
      const ly = cy + Math.sin(midAngle) * (r + 20);
      ctx.fillStyle = '#6b7280'; ctx.font = '12px sans-serif'; ctx.textAlign = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5 ? 'right' : 'left';
      ctx.fillText(`${labels[i]} ${v}%`, lx, ly);
      startAngle += sliceAngle;
    });
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#6366f1'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('100%', cx, cy + 7);
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.c3')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.c3.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Donut Chart - Distribution</h5>
            <canvas ref={canvasRef} width={400} height={280} className="w-100" style={{maxHeight:280}}></canvas>
          </div></div>
        </div>
      </div>
    </div>
  );
}
