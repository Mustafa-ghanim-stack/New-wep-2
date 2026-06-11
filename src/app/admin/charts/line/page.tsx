'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function LineChartsPage() {
  const { t } = useAdminLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data1 = [20, 35, 28, 45, 38, 50, 42, 55, 48, 52, 58, 62];
    const data2 = [15, 25, 32, 28, 40, 35, 48, 42, 50, 45, 52, 48];
    const w = canvasRef.current.width, h = canvasRef.current.height;
    const pad = 40; const gw = w - pad * 2; const gh = h - pad * 2;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = pad + (gh / 4) * i; ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); }
    ctx.stroke();
    const drawLine = (data: number[], color: string) => {
      ctx.beginPath(); ctx.lineWidth = 2.5; ctx.strokeStyle = color;
      data.forEach((v, i) => { const x = pad + (gw / (data.length - 1)) * i; const y = pad + gh - (v / 70) * gh; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
      ctx.beginPath(); ctx.fillStyle = color;
      data.forEach((v, i) => { const x = pad + (gw / (data.length - 1)) * i; const y = pad + gh - (v / 70) * gh; ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); });
    };
    drawLine(data1, '#6366f1'); drawLine(data2, '#22c55e');
    ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    months.forEach((m, i) => { const x = pad + (gw / (months.length - 1)) * i; ctx.fillText(m, x, h - 10); });
    ctx.textAlign = 'right';
    [0, 20, 40, 60].forEach(v => { const y = pad + gh - (v / 70) * gh; ctx.fillText(String(v), pad - 8, y + 4); });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6366f1'; ctx.fillRect(w - pad - 80, pad + 10, 12, 3); ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif'; ctx.fillText('Revenue', w - pad - 62, pad + 14);
    ctx.fillStyle = '#22c55e'; ctx.fillRect(w - pad - 80, pad + 28, 12, 3); ctx.fillStyle = '#6b7280'; ctx.fillText('Expenses', w - pad - 62, pad + 32);
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.charts.line')}</h1><p className="text-muted text-sm mb-0">{t('ui.charts.line.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Line Chart - Revenue vs Expenses</h5>
        <canvas ref={canvasRef} width={800} height={300} className="w-100" style={{maxHeight:300}}></canvas>
      </div></div>
    </div>
  );
}
