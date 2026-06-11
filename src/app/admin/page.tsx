'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Chart, registerables } from 'chart.js';
import { useAdminLang } from './admin-lang-context';

Chart.register(...registerables);

export default function AdminDashboard() {
  const { t } = useAdminLang();
  const earningsRef = useRef<HTMLCanvasElement>(null);
  const visitsRef = useRef<HTMLCanvasElement>(null);
  const pageViewsRef = useRef<HTMLCanvasElement>(null);
  const bounceRef = useRef<HTMLCanvasElement>(null);
  const earningsChartRef = useRef<Chart | null>(null);
  const visitsChartRef = useRef<Chart | null>(null);
  const pageViewsChartRef = useRef<Chart | null>(null);
  const bounceChartRef = useRef<Chart | null>(null);

  const [stats, setStats] = useState({ students: 0, professors: 0, courses: 0, departments: 0 });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

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
      const professors = p.items || [];
      const courses = c.items || [];
      const departments = d.items || [];
      setStats({
        students: students.length,
        professors: professors.length,
        courses: courses.length,
        departments: departments.length,
      });
      setRecentStudents(students.slice(-3).reverse());
      setRecentCourses(courses.slice(-3).reverse());
    });
  }, []);

  useEffect(() => {
    if (!earningsRef.current) return;
    earningsChartRef.current = new Chart(earningsRef.current, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: t('dash1.chart.earnings'),
          data: [12000, 19000, 15000, 25000, 22000, 28000, 31000, 29000, 34000, 38000, 42000, 48000],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#6366f1', pointRadius: 4,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    });
    return () => { earningsChartRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    const sparklineOpts = (color: string) => ({
      type: 'line' as const,
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } },
      data: { labels: ['', '', '', '', '', '', ''], datasets: [{ data: [3, 6, 4, 8, 5, 10, 7], borderColor: color, borderWidth: 2, tension: 0.4 }] },
    });
    if (visitsRef.current) visitsChartRef.current = new Chart(visitsRef.current, sparklineOpts('#0dcaf0'));
    if (pageViewsRef.current) pageViewsChartRef.current = new Chart(pageViewsRef.current, sparklineOpts('#10b981'));
    if (bounceRef.current) bounceChartRef.current = new Chart(bounceRef.current, sparklineOpts('#f59e0b'));
    return () => { visitsChartRef.current?.destroy(); pageViewsChartRef.current?.destroy(); bounceChartRef.current?.destroy(); };
  }, []);

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="badge bg-success">{t('students.status.approved')}</span>;
    if (status === 'rejected') return <span className="badge bg-danger">{t('students.status.rejected')}</span>;
    return <span className="badge bg-warning text-dark">{t('students.status.pending')}</span>;
  };

  const bgColors = ['0d6efd', '198754', '0dcaf0', 'dc3545', '6366f1', 'f59e0b'];

  return (
    <div className="container-fluid">
      <div className="mb-3">
        <h1 className="h3 font-bold">{t('dash1.title')}</h1>
        <p className="text-muted text-sm">{t('dash1.subtitle')}</p>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-4">
          <div className="stats-card">
            <div className="stats-card-label">{t('dash1.stat.professors')}</div>
            <div className="stats-card-value">{stats.professors}</div>
            <div className="progress-custom mt-2">
              <div className="progress-bar-custom bg-success" style={{ width: stats.professors > 0 ? '80%' : '0%' }}></div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-label">{t('dash1.stat.students')}</div>
            <div className="stats-card-value">{stats.students}</div>
            <div className="progress-custom mt-2">
              <div className="progress-bar-custom bg-danger" style={{ width: stats.students > 0 ? '80%' : '0%' }}></div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-label">{t('dash1.stat.courses')}</div>
            <div className="stats-card-value">{stats.courses}</div>
            <div className="progress-custom mt-2">
              <div className="progress-bar-custom bg-info" style={{ width: stats.courses > 0 ? '80%' : '0%' }}></div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-label">{t('dash1.stat.departments')}</div>
            <div className="stats-card-value">{stats.departments}</div>
            <div className="progress-custom mt-2">
              <div className="progress-bar-custom bg-warning" style={{ width: stats.departments > 0 ? '80%' : '0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="chart-wrapper">
            <div className="dashboard-card-header">
              <h5 className="dashboard-card-title">{t('dash1.chart.earnings')}</h5>
            </div>
            <div className="chart-container-main">
              <canvas id="earningsChart" ref={earningsRef}></canvas>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="stats-card-label">{t('dash1.chart.enrollment')}</div>
                  <div className="stats-card-value">{stats.students}</div>
                </div>
                <i className="bi bi-people text-info" style={{ fontSize: 24 }}></i>
              </div>
              <div className="chart-container-small"><canvas id="visitsSparkline" ref={visitsRef}></canvas></div>
            </div>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="stats-card-label">{t('dash1.stat.courses')}</div>
                  <div className="stats-card-value">{stats.courses}</div>
                </div>
                <i className="bi bi-book text-success" style={{ fontSize: 24 }}></i>
              </div>
              <div className="chart-container-small"><canvas id="pageViewsSparkline" ref={pageViewsRef}></canvas></div>
            </div>
            <div className="stats-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="stats-card-label">{t('dash1.stat.departments')}</div>
                  <div className="stats-card-value">{stats.departments}</div>
                </div>
                <i className="bi bi-building text-warning" style={{ fontSize: 24 }}></i>
              </div>
              <div className="chart-container-small"><canvas id="bounceRateSparkline" ref={bounceRef}></canvas></div>
            </div>
          </div>
        </div>
      </div>

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
                {recentStudents.map((s: any, i: number) => (
                  <div className="list-group-item d-flex align-items-center px-0 py-3" key={s.id}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.fullName)}&background=${bgColors[i % bgColors.length]}&color=fff`} alt={s.fullName} className="rounded-circle me-3" width="40" height="40" loading="lazy" />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{s.fullName}</h6>
                      <small className="text-muted">{s.department} {s.branch ? `- ${s.branch}` : ''}</small>
                      <div className="small text-muted">{s.email}</div>
                    </div>
                    {statusBadge(s.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header d-flex justify-content-between align-items-center">
            <h5 className="dashboard-card-title mb-0">{t('sidebar.courses.all')}</h5>
            <Link href="/admin/courses" className="btn btn-outline-primary btn-sm">{t('dash2.viewall')}</Link>
          </div>
          <div className="dashboard-card-body">
            {recentCourses.length === 0 ? (
              <div className="text-center text-muted py-4"><i className="bi bi-book" style={{ fontSize: 32 }}></i><p className="mt-2 mb-0">{t('courses.empty')}</p></div>
            ) : (
              <div className="list-group list-group-flush">
                {recentCourses.map((c: any, i: number) => (
                  <div className="list-group-item d-flex align-items-center px-0 py-3" key={c.id}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, background: `#${bgColors[i % bgColors.length]}20` }}>
                      <i className="bi bi-book" style={{ color: `#${bgColors[i % bgColors.length]}` }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{c.name || c.title}</h6>
                      <small className="text-muted">{c.professor || c.instructor || ''}</small>
                      {c.department && <div className="small text-muted">{c.department}</div>}
                    </div>
                    <span className="badge bg-success">{t('students.status.approved')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
