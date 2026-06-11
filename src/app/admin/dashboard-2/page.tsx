'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAdminLang } from '../admin-lang-context';
Chart.register(...registerables);

export default function Dashboard2Page() {
  const { t } = useAdminLang();
  const courseRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLCanvasElement>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);

  useEffect(() => {
    if (courseRef.current) {
      chart1Ref.current = new Chart(courseRef.current, {
        type: 'doughnut', data: {
          labels: ['Excellent (4.5+)', 'Good (4.0-4.4)', 'Average (3.5-3.9)', 'Below Average (<3.5)'],
          datasets: [{ data: [45, 32, 18, 5], backgroundColor: ['#198754', '#0d6efd', '#ffc107', '#dc3545'], borderWidth: 0 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }
      });
    }
    if (progressRef.current) {
      chart2Ref.current = new Chart(progressRef.current, {
        type: 'line', data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            { label: 'Completed Assignments (%)', data: [85, 88, 92, 87, 94, 91], borderColor: '#198754', backgroundColor: 'rgba(25,135,84,0.1)', tension: 0.4, fill: true },
            { label: 'Class Attendance (%)', data: [92, 90, 94, 96, 93, 95], borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', tension: 0.4, fill: true }
          ]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { min: 80, max: 100, ticks: { callback: (v: any) => v + '%' } } } }
      });
    }
    return () => { chart1Ref.current?.destroy(); chart2Ref.current?.destroy(); };
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 font-bold">{t('dash3.title')}</h1>
            <p className="text-muted text-sm">{t('dash3.subtitle')}</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary"><i className="bi bi-calendar-week me-2"></i>{t('dash3.calendar')}</button>
            <button className="btn btn-success"><i className="bi bi-plus-circle me-2"></i>{t('dash3.semester')}</button>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-4">
          {[
            { icon: 'book-half', color: '#198754', bg: 'success', value: '142', label: t('dash3.courses'), change: '+8', sub: t('dash3.sub.thisSemester') },
            { icon: 'people-fill', color: '#0d6efd', bg: 'primary', value: '9,284', label: t('dash3.students'), change: '+412', sub: t('dash3.sub.sinceLastMonth') },
            { icon: 'person-badge', color: '#ffc107', bg: 'warning', value: '68', label: t('dash3.faculty'), change: '+3', sub: t('dash3.sub.newHires') },
            { icon: 'award', color: '#0dcaf0', bg: 'info', value: '4.7', label: t('dash3.rating'), change: '+0.3', sub: t('dash3.sub.avgImprovement') },
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
                <div className="text-success small fw-semibold"><i className="bi bi-arrow-up" style={{ fontSize: 12 }}></i> {c.change}</div>
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
              <h5 className="dashboard-card-title mb-0">{t('dash3.performance')}</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">{t('dash3.current')}</button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('dash3.current')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash3.filter.lastSemester')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('dash3.filter.academicYear')}</a></li>
                </ul>
              </div>
            </div>
            <div className="dashboard-card-body"><div className="chart-container" style={{ height: 250 }}><canvas ref={courseRef}></canvas></div></div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash3.progress')}</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">{t('dash3.alldept')}</button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('dash3.alldept')}</a></li>
                  <li><a className="dropdown-item" href="#">Computer Science</a></li>
                  <li><a className="dropdown-item" href="#">Mathematics</a></li>
                  <li><a className="dropdown-item" href="#">Biology</a></li>
                </ul>
              </div>
            </div>
            <div className="dashboard-card-body"><div className="chart-container" style={{ height: 250 }}><canvas ref={progressRef}></canvas></div></div>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-3">
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash3.dept')}</h6></div>
            <div className="dashboard-card-body">
              {[
                { color: '#0d6efd', label: 'Computer Science', courses: '34', pct: '45%' },
                { color: '#198754', label: 'Mathematics', courses: '28', pct: '37%' },
                { color: '#0dcaf0', label: 'Biology', courses: '22', pct: '29%' },
              ].map(d => (
                <div className="mb-3" key={d.label}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <div className="rounded me-2" style={{ width: 8, height: 8, backgroundColor: d.color }}></div>
                      <span className="small">{d.label}</span>
                    </div>
                    <strong>{d.courses} {t('dash3.label.courses')}</strong>
                  </div>
                  <div className="progress progress-sm"><div className="progress-bar" style={{ width: d.pct, backgroundColor: d.color }}></div></div>
                </div>
              ))}
              <div className="small text-muted"><strong>{t('dash3.label.total')}</strong> 84 {t('dash3.label.coursesAcross')} 12 {t('dash3.label.departments')}</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash3.cal')}</h6></div>
            <div className="dashboard-card-body">
              {[
                { icon: 'calendar-event', color: '#ffc107', label: 'Spring Registration', sub: 'Opens February 1st', badge: 'In 2 weeks', badgeColor: 'warning' },
                { icon: 'mortarboard', color: '#0d6efd', label: 'Midterm Exams', sub: 'March 15-22, 2025', badge: 'In 8 weeks', badgeColor: 'primary' },
                { icon: 'trophy', color: '#198754', label: 'Graduation Ceremony', sub: 'May 18, 2025', badge: 'In 16 weeks', badgeColor: 'success' },
              ].map((e, i) => (
                <div className={i < 2 ? 'mb-3' : ''} key={e.label}>
                  <div className="d-flex align-items-start">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: `${e.color}1a` }}>
                      <i className={`bi bi-${e.icon}`} style={{ fontSize: 14, color: e.color }}></i>
                    </div>
                    <div>
                      <h6 className="mb-1">{e.label}</h6>
                      <small className="text-muted">{e.sub}</small>
                      <div className={`small fw-semibold text-${e.badgeColor}`}>{e.badge}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header"><h6 className="dashboard-card-title">{t('dash3.quick')}</h6></div>
            <div className="dashboard-card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm"><i className="bi bi-plus-circle me-2"></i>{t('dash3.create')}</button>
                <button className="btn btn-outline-success btn-sm"><i className="bi bi-person-plus me-2"></i>{t('dash3.enroll')}</button>
                <button className="btn btn-outline-info btn-sm"><i className="bi bi-calendar-plus me-2"></i>{t('dash3.schedule')}</button>
                <button className="btn btn-outline-warning btn-sm"><i className="bi bi-file-earmark-text me-2"></i>{t('dash3.grade')}</button>
                <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-gear me-2"></i>{t('dash3.settings')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-2">
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash3.activity')}</h5>
              <a href="/admin/courses" className="btn btn-outline-primary btn-sm">{t('dash2.viewall')}</a>
            </div>
            <div className="dashboard-card-body">
              <div className="list-group list-group-flush">
                {[
                  { icon: 'plus-circle', color: '#0d6efd', label: 'New Course Created', sub: 'Advanced Machine Learning', time: 'Prof. Sarah Johnson - 2 hours ago', badge: 'New', badgeColor: 'primary' },
                  { icon: 'person-check', color: '#198754', label: 'Student Enrollment', sub: '15 new students in Data Structures', time: 'Prof. Michael Chen - 4 hours ago', badge: '+15', badgeColor: 'success' },
                  { icon: 'file-earmark-check', color: '#ffc107', label: 'Assignment Graded', sub: 'Programming Assignment #3', time: 'Prof. Lisa Wang - 6 hours ago', badge: '85% avg', badgeColor: 'warning text-dark' },
                ].map(a => (
                  <div className="list-group-item d-flex align-items-center px-0 py-3" key={a.label}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, backgroundColor: `${a.color}1a` }}>
                      <i className={`bi bi-${a.icon}`} style={{ color: a.color, fontSize: 16 }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{a.label}</h6>
                      <small className="text-muted">{a.sub}</small>
                      <div className="small text-muted">{a.time}</div>
                    </div>
                    <span className={`badge bg-${a.badgeColor}`}>{a.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header d-flex justify-content-between align-items-center">
              <h5 className="dashboard-card-title mb-0">{t('dash3.topcourses')}</h5>
              <a href="#" className="btn btn-outline-primary btn-sm">{t('dash2.viewreport')}</a>
            </div>
            <div className="dashboard-card-body">
              <div className="list-group list-group-flush">
                {[
                  { rank: 1, color: '#198754', name: 'Advanced Programming', prof: 'Prof. Sarah Johnson', rating: '4.9/5.0', pct: '98%', enrolled: '45' },
                  { rank: 2, color: '#0d6efd', name: 'Data Structures', prof: 'Prof. Michael Chen', rating: '4.8/5.0', pct: '96%', enrolled: '38' },
                  { rank: 3, color: '#ffc107', name: 'Machine Learning', prof: 'Prof. David Kim', rating: '4.7/5.0', pct: '94%', enrolled: '32' },
                ].map(c => (
                  <div className="list-group-item d-flex align-items-center px-0 py-3" key={c.name}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, backgroundColor: `${c.color}1a` }}>
                      <strong style={{ color: c.color, fontSize: 16, fontWeight: 'bold' }}>{c.rank}</strong>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{c.name}</h6>
                      <small className="text-muted">{c.prof}</small>
                      <div className="small text-success">{c.rating} {t('dash3.label.rating')} • {c.pct} {t('dash3.label.completion')}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ color: c.color }}>{c.enrolled}</div>
                      <small className="text-muted">{t('dash3.label.enrolled')}</small>
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
