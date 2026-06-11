'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function BarChartsPage() {
  const { t } = useAdminLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const labels = ['Math','Physics','Chem','Bio','CS','English'];
    const data = [85, 72, 68, 90, 78, 82];
    const colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#a855f7'];
    const w = canvasRef.current.width, h = canvasRef.current.height;
    const pad = 40; const gw = w - pad * 2; const gh = h - pad * 2;
    const bw = gw / labels.length * 0.6;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = pad + (gh / 4) * i; ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); }
    ctx.stroke();
    data.forEach((v, i) => {
      const x = pad + (gw / labels.length) * i + (gw / labels.length - bw) / 2;
      const bh = (v / 100) * gh;
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, pad + gh - bh, bw, bh);
      ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], pad + (gw / labels.length) * i + (gw / labels.length) / 2, h - 10);
      ctx.fillText(String(v), pad + (gw / labels.length) * i + (gw / labels.length) / 2, pad + gh - bh - 8);
    });
    ctx.textAlign = 'right';
    [0, 25, 50, 75, 100].forEach(v => { const y = pad + gh - (v / 100) * gh; ctx.fillText(String(v), pad - 8, y + 4); });
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.bar')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.bar.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Bar Chart - Average Scores by Subject</h5>
        <canvas ref={canvasRef} width={800} height={300} className="w-100" style={{maxHeight:300}}></canvas>
      </div></div>
    </div>
  );
}
