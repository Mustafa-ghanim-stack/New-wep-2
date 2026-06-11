'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function AreaChartsPage() {
  const { t } = useAdminLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, '#6366f180');
    grad.addColorStop(1, '#6366f105');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data = [30, 45, 35, 50, 40, 55, 65, 48, 52, 58, 62, 70];
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const pad = 40; const gw = w - pad * 2; const gh = h - pad * 2;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = pad + (gh / 4) * i; ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); }
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, pad + gh); ctx.lineWidth = 3; ctx.strokeStyle = '#6366f1';
    data.forEach((v, i) => { const x = pad + (gw / (data.length - 1)) * i; const y = pad + gh - (v / 100) * gh; ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.lineTo(pad + gw, pad + gh); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.fillStyle = '#6366f1';
    data.forEach((v, i) => { const x = pad + (gw / (data.length - 1)) * i; const y = pad + gh - (v / 100) * gh; ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    data.forEach((v, i) => { const x = pad + (gw / (data.length - 1)) * i; ctx.fillText(months[i], x, h - 10); });
    ctx.textAlign = 'right';
    [0, 25, 50, 75, 100].forEach(v => { const y = pad + gh - (v / 100) * gh; ctx.fillText(String(v), pad - 8, y + 4); });
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.area')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.area.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Area Chart - Monthly Revenue</h5>
        <canvas ref={canvasRef} width={800} height={300} className="w-100" style={{maxHeight:300}}></canvas>
      </div></div>
    </div>
  );
}
