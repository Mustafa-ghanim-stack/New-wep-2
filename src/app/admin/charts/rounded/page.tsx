'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function RoundedChartsPage() {
  const { t } = useAdminLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const w = canvasRef.current.width, h = canvasRef.current.height;
    const cx = w / 3, cy = h / 2, r = Math.min(cx, cy) - 20;
    const data = [65, 20, 15];
    const colors = ['#6366f1', '#22c55e', '#f59e0b'];
    const labels = ['Completed 65%', 'In Progress 20%', 'Pending 15%'];
    ctx.clearRect(0, 0, w, h);
    let start = -Math.PI / 2;
    const total = data.reduce((a, b) => a + b, 0);
    data.forEach((v, i) => {
      const slice = (v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + slice); ctx.lineWidth = 20; ctx.strokeStyle = colors[i]; ctx.stroke();
      start += slice;
    });
    ctx.fillStyle = '#6366f1'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('65%', cx, cy + 6);
    ctx.font = '11px sans-serif'; ctx.fillStyle = '#6b7280'; ctx.fillText('Completed', cx, cy + 24);
    ctx.textAlign = 'left';
    labels.forEach((l, i) => { const y = 20 + i * 24; ctx.fillStyle = colors[i]; ctx.fillRect(w / 2 + 10, y, 12, 12); ctx.fillStyle = '#6b7280'; ctx.font = '12px sans-serif'; ctx.fillText(l, w / 2 + 28, y + 11); });
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.rounded')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.rounded.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Rounded Chart - Project Status</h5>
        <canvas ref={canvasRef} width={500} height={200} className="w-100" style={{maxHeight:200}}></canvas>
      </div></div>
    </div>
  );
}
