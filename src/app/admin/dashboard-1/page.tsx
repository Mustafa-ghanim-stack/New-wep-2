'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Chart, registerables } from 'chart.js';
import { useAdminLang } from '../admin-lang-context';
Chart.register(...registerables);

export default function Dashboard1Page() {
  const { t } = useAdminLang();
  const [stats, setStats] = useState({ students: 0, courses: 0, professors: 0, departments: 0 });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const revenueRef = useRef<HTMLCanvasElement>(null);
  const enrollmentRef = useRef<HTMLCanvasElement>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);

  useEffect(() => {
    const token = (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
    if (!token) return;
    Promise.all([
      fetch(`/api/students?token=${token}`).then(r => r.json()),
      fetch(`/api/professors?token=${token}`).then(r => r.json()),
      fetch(`/api/courses?token=${token}`).then(r => r.json()),
      fetch(`/api/departments?token=${token}`).then(r => r.json()),
    ]).then(([s, p, c, d]) => {
      const students = s.students || [];
      setStats({ students: students.length, professors: (p.items||[]).length, courses: (c.items||[]).length, departments: (d.items||[]).length });
      setRecentStudents(students.slice(-3).reverse());
    });
  }, []);

  useEffect(() => {
    if (revenueRef.current) {
      chart1Ref.current = new Chart(revenueRef.current, {
        type: 'line', data: {
          labels: ['Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025'],
          datasets: [{
            label: 'Revenue ($000)', data: [380, 420, 450, 480, 390, 520],
            borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)',
            tension: 0.4, fill: true, pointRadius: 6, pointHoverRadius: 8
          }]
        }, options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => '$' + v + 'K' } } }
        }
      });
    }
    if (enrollmentRef.current) {
      chart2Ref.current = new Chart(enrollmentRef.current, {
        type: 'bar', data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ label: 'New Enrollments', data: [1200, 1100, 1350, 1250, 1400, 1320], backgroundColor: '#198754', borderRadius: 4 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
    return () => { chart1Ref.current?.destroy(); chart2Ref.current?.destroy(); };
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 font-bold">{t('dash2.title')}</h1>
            <p className="text-muted text-sm">{t('dash2.subtitle')}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary"><i className="bi bi-download me-2"></i>{t('dash2.export')}</button>
            <button className="btn btn-primary"><i className="bi bi-graph-up me-2"></i>{t('dash2.analytics')}</button>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-4">
          {[
            { icon: 'people', color: '#198754', bg: 'success', value: stats.students, label: t('dash2.students'), change: '', sub: '' },
            { icon: 'person-badge', color: '#0d6efd', bg: 'primary', value: stats.professors, label: t('dash1.stat.professors'), change: '', sub: '' },
            { icon: 'book', color: '#0dcaf0', bg: 'info', value: stats.courses, label: t('dash2.courses'), change: '', sub: '', dash: true },
            { icon: 'building', color: '#ffc107', bg: 'warning', value: stats.departments, label: t('dash1.stat.departments'), change: '', sub: '' },
          ].map(c => (
            <div className="dashboard-card" key={c.label}>
              <div className="dashboard-card-body text-center">
                <div className="mb-3">
                  <div className={`stat-icon-large bg-${c.bg} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto`} style={{ width: 60, height: 60 }}>
                    <i className={`bi bi-${c.icon}`} style={{ fontSize: 24, color: c.color }}></i>
                  </div>
                </div>
                <div className="stat-value fw-bold mb-1" style={{ fontSize: '2rem', color: c.color }}>{c.value}</div>
                <div className="stat-label text-muted mb-2">{c.label}</div>
                <div className={`small fw-semibold ${c.dash ? 'text-secondary' : 'text-success'}`}>
                  <i className={`bi bi-${c.dash ? 'dash-lg' : 'arrow-up'}`} style={{ fontSize: 12 }}></i> {c.change}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-2">
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash2.revenue.trend')}</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">{t('dash2.last6')}</button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.3months')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.6months')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.thisyear')}</a></li>
                </ul>
              </div>
            </div>
            <div className="dashboard-card-body"><div className="chart-container" style={{ height: 250 }}><canvas ref={revenueRef}></canvas></div></div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash2.enrollment')}</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">{t('dash2.thisyear')}</button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.thismonth')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.thisyear')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash2.filter.alltime')}</a></li>
                </ul>
              </div>
            </div>
            <div className="dashboard-card-body"><div className="chart-container" style={{ height: 250 }}><canvas ref={enrollmentRef}></canvas></div></div>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-3">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash2.performance')}</h6></div>
            <div className="dashboard-card-body">
              <div className="row text-center">
                <div className="col-4"><div className="border-end"><div className="fw-bold text-success">98%</div><small className="text-muted">{t('dash2.completion')}</small></div></div>
                <div className="col-4"><div className="border-end"><div className="fw-bold text-primary">4.6</div><small className="text-muted">{t('dash2.rating')}</small></div></div>
                <div className="col-4"><div className="fw-bold text-info">92%</div><small className="text-muted">{t('dash2.passrate')}</small></div>
              </div>
              <hr className="my-3" />
              <div className="small text-muted"><strong>{t('dash2.top')}</strong> {t('dash2.top.course')}</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash2.financial')}</h6></div>
            <div className="dashboard-card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2"><span>{t('dash2.tuition')}</span><strong className="text-success">$1.8M</strong></div>
                <div className="progress progress-sm"><div className="progress-bar bg-success" style={{ width: '75%' }}></div></div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2"><span>{t('dash2.other')}</span><strong className="text-primary">$600K</strong></div>
                <div className="progress progress-sm"><div className="progress-bar bg-primary" style={{ width: '25%' }}></div></div>
              </div>
              <div className="small text-muted"><strong>{t('dash2.budget')}:</strong> 82% {t('dash2.annual')}</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash2.quick')}</h6></div>
            <div className="dashboard-card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm"><i className="bi bi-file-earmark-text me-2"></i>{t('dash2.report')}</button>
                <button className="btn btn-outline-success btn-sm"><i className="bi bi-person-plus me-2"></i>{t('dash2.addstudent')}</button>
                <button className="btn btn-outline-info btn-sm"><i className="bi bi-book-half me-2"></i>{t('dash2.newcourse')}</button>
                <button className="btn btn-outline-warning btn-sm"><i className="bi bi-calendar-event me-2"></i>{t('dash2.schedule')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-2">
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('sidebar.students.all')}</h5>
              <Link href="/admin/students" className="btn btn-outline-primary btn-sm">{t('dash2.viewall')}</Link>
            </div>
            <div className="dashboard-card-body">
              {recentStudents.length === 0 ? (
                <div className="text-center text-muted py-4"><i className="bi bi-people" style={{ fontSize: 32 }}></i><p className="mt-2 mb-0">{t('students.empty')}</p></div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentStudents.map((s: any, i: number) => {
                    const colors = [['#ffc107','#fff3cd','#b25500'],['#6c757d','#f8f9fa','#495057'],['#0dcaf0','#cff4fc','#055160']];
                    const [border, bg, textColor] = colors[i % colors.length];
                    return (
                      <div className="list-group-item d-flex align-items-center px-0 py-3" key={s.id}>
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, border: `2px solid ${border}`, backgroundColor: bg }}>
                          <strong style={{ color: textColor, fontSize: 14 }}>{i + 1}</strong>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{s.fullName}</h6>
                          <small className="text-muted">{s.department}{s.branch ? ` - ${s.branch}` : ''}</small>
                          <div className="small text-muted">{s.email}</div>
                        </div>
                        <span className={`badge ${s.status === 'approved' ? 'bg-success' : s.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {s.status === 'approved' ? t('students.status.approved') : s.status === 'rejected' ? t('students.status.rejected') : t('students.status.pending')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash2.revenuesrc')}</h5>
              <a href="#" className="btn btn-outline-primary btn-sm">{t('dash2.viewreport')}</a>
            </div>
            <div className="dashboard-card-body">
              <div className="list-group list-group-flush">
                {[
                  { icon: 'mortarboard', color: '#198754', label: t('dash2.tuition'), sub: 'Undergraduate & Graduate', pct: '75% of total revenue', value: '$1.8M', chg: '+12%' },
                  { icon: 'building', color: '#0d6efd', label: 'Facility Rentals', sub: 'Events & Conferences', pct: '15% of total revenue', value: '$360K', chg: '+8%' },
                  { icon: 'gift', color: '#0dcaf0', label: 'Grants & Donations', sub: 'Research & Scholarships', pct: '10% of total revenue', value: '$240K', chg: '+25%' },
                ].map(r => (
                  <div className="list-group-item d-flex align-items-center px-0 py-3" key={r.label}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, backgroundColor: `${r.color}1a` }}>
                      <i className={`bi bi-${r.icon}`} style={{ color: r.color }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{r.label}</h6>
                      <small className="text-muted">{r.sub}</small>
                      <div className="small text-muted">{r.pct}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color: r.color }}>{r.value}</div>
                      <small className="text-success">{r.chg}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
