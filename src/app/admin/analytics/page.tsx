'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../admin-lang-context';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function AnalyticsPage() {
  const { t } = useAdminLang();
  const enrollmentRef = useRef<HTMLCanvasElement>(null);
  const deptRef = useRef<HTMLCanvasElement>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);

  useEffect(() => {
    if (enrollmentRef.current) {
      chart1Ref.current = new Chart(enrollmentRef.current, {
        type: 'line', data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            { label: 'Students', data: [7200, 7400, 7800, 8100, 8300, 8200, 8400, 8500, 8542, 8600, 8700, 8800], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.3, fill: true },
            { label: 'Courses', data: [120, 125, 130, 135, 140, 138, 142, 145, 148, 150, 152, 155], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3, fill: true }
          ]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: false } } }
      });
    }
    if (deptRef.current) {
      chart2Ref.current = new Chart(deptRef.current, {
        type: 'doughnut', data: {
          labels: [t('analytics.engineering'), t('analytics.business'), t('analytics.medicine'), t('analytics.arts')],
          datasets: [{ data: [35, 28, 22, 15], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4'], borderWidth: 0 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
    return () => { chart1Ref.current?.destroy(); chart2Ref.current?.destroy(); };
  }, [t]);

  const sub = (pct: string) => {
    const num = parseFloat(pct);
    if (num > 0) return { icon: 'arrow-up', cls: 'bg-success-subtle text-success' };
    if (num < 0) return { icon: 'dash', cls: 'bg-warning-subtle text-warning' };
    return { icon: 'dash-lg', cls: 'bg-secondary-subtle text-secondary' };
  };

  const perfs = [
    { label: t('analytics.mathematics'), pct: 85, color: '#6366f1' },
    { label: t('analytics.science'), pct: 78, color: '#10b981' },
    { label: t('analytics.literature'), pct: 92, color: '#06b6d4' },
    { label: t('analytics.history'), pct: 71, color: '#f59e0b' },
    { label: t('analytics.compSci'), pct: 88, color: '#dc3545' },
  ];

  const activities = [
    { icon: 'person-plus', color: '#6366f1', label: t('analytics.activity.register'), desc: t('analytics.activity.register.desc'), time: '2 ' + t('analytics.hoursAgo') },
    { icon: 'check-circle', color: '#10b981', label: t('analytics.activity.course'), desc: t('analytics.activity.course.desc'), time: '5 ' + t('analytics.hoursAgo') },
    { icon: 'trophy', color: '#f59e0b', label: t('analytics.activity.achievement'), desc: t('analytics.activity.achievement.desc'), time: '1 ' + t('analytics.dayAgo') },
    { icon: 'calendar-check', color: '#06b6d4', label: t('analytics.activity.event'), desc: t('analytics.activity.event.desc'), time: '2 ' + t('analytics.daysAgo') },
  ];

  const students = [
    { name: 'Emily Chen', dept: t('analytics.compSciDept'), gpa: '3.95', att: '98%', id: '2025001' },
    { name: 'Michael Davis', dept: t('analytics.engineering'), gpa: '3.88', att: '95%', id: '2025002' },
    { name: 'Sarah Johnson', dept: t('analytics.medicine'), gpa: '3.92', att: '96%', id: '2025003' },
    { name: 'James Wilson', dept: t('analytics.business'), gpa: '3.85', att: '93%', id: '2025004' },
    { name: 'Lisa Anderson', dept: t('analytics.arts'), gpa: '3.79', att: '91%', id: '2025005' },
  ];

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div><h1 className="h3 font-bold mb-0">{t('analytics.title')}</h1><p className="text-muted mb-0">{t('analytics.subtitle')}</p></div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm">{t('analytics.day')}</button>
            <button className="btn btn-outline-secondary btn-sm">{t('analytics.week')}</button>
            <button className="btn btn-primary btn-sm">{t('analytics.month')}</button>
            <button className="btn btn-outline-secondary btn-sm">{t('analytics.year')}</button>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <h2 className="h5 fw-semibold mb-4">{t('analytics.keyMetrics')}</h2>
        <div className="dashboard-grid grid-cols-4">
          {[
            { icon: 'people-fill', color: '#6366f1', value: '8,542', label: t('analytics.totalStudents'), change: '+12.5%', pct: 75 },
            { icon: 'check-circle-fill', color: '#10b981', value: '87.3%', label: t('analytics.courseCompletion'), change: '+5.2%', pct: 87 },
            { icon: 'star-fill', color: '#f59e0b', value: '3.42', label: t('analytics.avgGpa'), change: '-0.8%', pct: 68 },
            { icon: 'currency-dollar', color: '#06b6d4', value: '$124.5K', label: t('analytics.revenue'), change: '+18.2%', pct: 82 },
          ].map(c => {
            const s = sub(c.change);
            return (
              <div className="dashboard-card" key={c.label}>
                <div className="dashboard-card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div><p className="text-muted mb-1 small">{c.label}</p><h4 className="mb-0">{c.value}</h4></div>
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: `${c.color}20` }}>
                      <i className={`bi bi-${c.icon}`} style={{ color: c.color, fontSize: 20 }}></i>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <span className={`badge ${s.cls} me-2`}>
                      <i className={`bi bi-${s.icon}`}></i> {c.change}
                    </span>
                    <span className="text-muted small">{t('analytics.vsLastMonth')}</span>
                  </div>
                  <div className="progress mt-3" style={{ height: 4 }}>
                    <div className="progress-bar" style={{ width: `${c.pct}%`, background: c.color }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dashboard-row">
        <h2 className="h5 fw-semibold mb-4">{t('analytics.dataViz')}</h2>
        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="dashboard-card">
            <div className="dashboard-card-header py-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{t('analytics.enrollmentTrends')}</h6>
                <div className="dropdown">
                  <button className="btn btn-sm btn-light" data-bs-toggle="dropdown"><i className="bi bi-three-dots"></i></button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#">{t('analytics.exportData')}</a></li>
                    <li><a className="dropdown-item" href="#">{t('analytics.printChart')}</a></li>
                    <li><a className="dropdown-item" href="#">{t('analytics.refresh')}</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="dashboard-card-body p-4"><div style={{ height: 250 }}><canvas ref={enrollmentRef}></canvas></div></div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header py-4 px-4"><h6 className="mb-0">{t('analytics.deptDistribution')}</h6></div>
            <div className="dashboard-card-body p-4">
              <div style={{ height: 200 }}><canvas ref={deptRef}></canvas></div>
              <div className="mt-3">
                {[
                  { label: t('analytics.engineering'), pct: 35, color: '#6366f1' },
                  { label: t('analytics.business'), pct: 28, color: '#10b981' },
                  { label: t('analytics.medicine'), pct: 22, color: '#f59e0b' },
                  { label: t('analytics.arts'), pct: 15, color: '#06b6d4' },
                ].map((d, i) => (
                  <div className={`d-flex justify-content-between ${i < 3 ? 'mb-3' : ''}`} key={d.label}>
                    <span className="small"><i className="bi bi-circle-fill me-1" style={{ color: d.color }}></i> {d.label}</span>
                    <span className="fw-bold">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <h2 className="h5 fw-semibold mb-4">{t('analytics.perfActivities')}</h2>
        <div className="dashboard-grid grid-cols-2">
          <div className="dashboard-card">
            <div className="dashboard-card-header py-4 px-4"><h6 className="mb-0">{t('analytics.perfSubject')}</h6></div>
            <div className="dashboard-card-body px-4 py-3">
              {perfs.map(p => (
                <div className="mb-4" key={p.label}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>{p.label}</span>
                    <span className="fw-bold">{p.pct}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar" style={{ width: `${p.pct}%`, backgroundColor: p.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header py-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{t('analytics.recentActivities')}</h6>
                <a href="#" className="text-primary small">{t('analytics.viewAll')}</a>
              </div>
            </div>
            <div className="dashboard-card-body px-4 py-3">
              {activities.map((a, i) => (
                <div className={`d-flex align-items-start py-3 ${i < activities.length - 1 ? 'border-bottom' : ''}`} key={a.label}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: `${a.color}1a` }}>
                    <i className={`bi bi-${a.icon}`} style={{ color: a.color, fontSize: 16 }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 small">{a.label}</h6>
                    <p className="text-muted small mb-0">{a.desc}</p>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <h2 className="h5 fw-semibold mb-4">{t('analytics.studentTable')}</h2>
        <div className="dashboard-card">
          <div className="dashboard-card-header py-4 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">{t('analytics.topStudents')}</h6>
              <button className="btn btn-sm btn-primary"><i className="bi bi-download me-1"></i> {t('analytics.export')}</button>
            </div>
          </div>
          <div className="dashboard-card-body px-4 py-3">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('analytics.colStudent')}</th>
                    <th>{t('analytics.colDepartment')}</th>
                    <th>{t('analytics.colGpa')}</th>
                    <th>{t('analytics.colAttendance')}</th>
                    <th>{t('analytics.colStatus')}</th>
                    <th>{t('analytics.colAction')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={`https://ui-avatars.com/api/?name=${s.name.replace(' ', '+')}&background=6366f1&color=fff`} className="rounded-circle me-2" width="32" height="32" alt={s.name} loading="lazy" />
                          <div>
                            <div className="fw-semibold">{s.name}</div>
                            <div className="text-muted small">{t('analytics.id')}: {s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.dept}</td>
                      <td><span className="badge bg-success">{s.gpa}</span></td>
                      <td>{s.att}</td>
                      <td><span className="badge bg-success-subtle text-success">{t('analytics.active')}</span></td>
                      <td><button className="btn btn-sm btn-light">{t('analytics.view')}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
