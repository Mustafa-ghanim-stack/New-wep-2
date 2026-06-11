'use client';
import { useEffect, useRef } from 'react';
import { useAdminLang } from '../admin-lang-context';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function WidgetsPage() {
  const { t, lang } = useAdminLang();
  const enrollmentRef = useRef<HTMLCanvasElement>(null);
  const gradeRef = useRef<HTMLCanvasElement>(null);
  const revenueRef = useRef<HTMLCanvasElement>(null);
  const chart1Ref = useRef<Chart | null>(null);
  const chart2Ref = useRef<Chart | null>(null);
  const chart3Ref = useRef<Chart | null>(null);

  useEffect(() => {
    if (enrollmentRef.current) {
      chart1Ref.current = new Chart(enrollmentRef.current, {
        type: 'line', data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ data: [120, 135, 145, 132, 148, 156, 165], borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
      });
    }
    if (gradeRef.current) {
      chart2Ref.current = new Chart(gradeRef.current, {
        type: 'doughnut', data: {
          labels: ['A', 'B', 'C', 'D/F'],
          datasets: [{ data: [35, 40, 20, 5], backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545'], borderWidth: 0 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '60%' }
      });
    }
    if (revenueRef.current) {
      chart3Ref.current = new Chart(revenueRef.current, {
        type: 'bar', data: {
          labels: ['CS', 'Math', 'Phy', 'Chem', 'Bio'],
          datasets: [{ data: [85000, 72000, 58000, 67000, 75000], backgroundColor: '#198754', borderRadius: 4 }]
        }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
      });
    }
    return () => { chart1Ref.current?.destroy(); chart2Ref.current?.destroy(); chart3Ref.current?.destroy(); };
  }, []);

  const statWidgets = [
    { icon: 'people-fill', bg: 'primary', value: '2,847', label: t('widgets.totalStudents'), change: '+12%', up: true },
    { icon: 'person-badge-fill', bg: 'success', value: '185', label: t('widgets.activeProfessors'), change: '+3%', up: true },
    { icon: 'book-fill', bg: 'warning', value: '127', label: t('widgets.availableCourses'), change: t('widgets.noChange'), up: null },
    { icon: 'currency-dollar', bg: 'danger', value: '$89,245', label: t('widgets.monthlyRevenue'), change: '+8%', up: true },
  ];

  const progressSubjects = [
    { label: t('widgets.computerScience'), pct: 87, color: 'primary' },
    { label: t('widgets.mathematics'), pct: 72, color: 'success' },
    { label: t('widgets.physics'), pct: 64, color: 'warning' },
    { label: t('widgets.chemistry'), pct: 58, color: 'danger' },
  ];

  const assignments = [
    { label: t('widgets.submitted'), count: '156/200', pct: 78, color: 'success' },
    { label: t('widgets.pendingReview'), count: '28/200', pct: 14, color: 'warning' },
    { label: t('widgets.overdue'), count: '16/200', pct: 8, color: 'danger' },
  ];

  const dayNames = [t('widgets.sun'), t('widgets.mon'), t('widgets.tue'), t('widgets.wed'), t('widgets.thu'), t('widgets.fri'), t('widgets.sat')];

  const calendarDays = [
    [31, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 1, 2, 3, 4],
  ];

  const events = [
    { day: 15, month: 'SEP', title: t('widgets.facultyMeeting'), location: t('widgets.facultyMeetingLoc'), time: t('widgets.facultyMeetingTime'), color: 'primary' },
    { day: 18, month: 'SEP', title: t('widgets.studentOrientation'), location: t('widgets.studentOrientationLoc'), time: t('widgets.studentOrientationTime'), color: 'success' },
    { day: 22, month: 'SEP', title: t('widgets.scienceFair'), location: t('widgets.scienceFairLoc'), time: t('widgets.scienceFairTime'), color: 'warning' },
    { day: 25, month: 'SEP', title: t('widgets.workshop'), location: t('widgets.workshopLoc'), time: t('widgets.workshopTime'), color: 'danger' },
  ];

  const tasks = [
    { label: t('widgets.reviewApplications'), done: true },
    { label: t('widgets.prepareLectures'), done: false },
    { label: t('widgets.gradeExams'), done: false },
    { label: t('widgets.updateSyllabus'), done: false },
    { label: t('widgets.sendReminders'), done: true },
    { label: t('widgets.scheduleMeetings'), done: false },
  ];

  const socialFeed = [
    { icon: 'facebook', bg: 'primary', title: t('widgets.facebookFollower'), desc: t('widgets.facebookFollowerDesc'), time: '2 ' + t('widgets.hoursAgo') },
    { icon: 'twitter-x', bg: 'info', title: t('widgets.tweetEvent'), desc: t('widgets.tweetEventDesc'), time: '4 ' + t('widgets.hoursAgo') },
    { icon: 'linkedin', bg: 'primary', title: t('widgets.linkedinArticle'), desc: t('widgets.linkedinArticleDesc'), time: '6 ' + t('widgets.hoursAgo') },
    { icon: 'instagram', bg: 'danger', title: t('widgets.instagramPhoto'), desc: t('widgets.instagramPhotoDesc'), time: '8 ' + t('widgets.hoursAgo') },
  ];

  const quickActions = [
    { icon: 'person-plus', label: t('widgets.addStudentTool'), color: 'primary' },
    { icon: 'book', label: t('widgets.newCourseTool'), color: 'success' },
    { icon: 'calendar-event', label: t('widgets.scheduleEventTool'), color: 'warning' },
    { icon: 'envelope', label: t('widgets.sendEmailTool'), color: 'info' },
    { icon: 'file-earmark-text', label: t('widgets.generateReportTool'), color: 'danger' },
    { icon: 'gear', label: t('widgets.settingsTool'), color: 'secondary' },
  ];

  const notifications = [
    { icon: 'person-plus', bg: 'primary', title: t('widgets.newRegistration'), desc: t('widgets.newRegistrationDesc'), time: '5 ' + t('widgets.minutesAgo'), dot: true },
    { icon: 'check-circle', bg: 'success', title: t('widgets.assignmentSubmitted'), desc: t('widgets.assignmentSubmittedDesc'), time: '15 ' + t('widgets.minutesAgo'), dot: false },
    { icon: 'exclamation-triangle', bg: 'warning', title: t('widgets.paymentReminder'), desc: t('widgets.paymentReminderDesc'), time: '1 ' + t('widgets.hoursAgo'), dot: true },
    { icon: 'calendar-event', bg: 'info', title: t('widgets.eventReminder'), desc: t('widgets.eventReminderDesc'), time: '2 ' + t('widgets.hoursAgo'), dot: false },
  ];

  const timeline = [
    { marker: 'primary', title: t('widgets.courseCreated'), desc: t('widgets.courseCreatedDesc'), time: '09:30 AM' },
    { marker: 'success', title: t('widgets.studentEnrolled'), desc: t('widgets.studentEnrolledDesc'), time: '11:15 AM' },
    { marker: 'warning', title: t('widgets.systemMaintenance'), desc: t('widgets.systemMaintenanceDesc'), time: '02:00 PM' },
    { marker: 'info', title: t('widgets.gradeUpdated'), desc: t('widgets.gradeUpdatedDesc'), time: '03:45 PM' },
    { marker: 'danger', title: t('widgets.alertGenerated'), desc: t('widgets.alertGeneratedDesc'), time: '04:20 PM' },
  ];

  const isRtl = lang === 'ar';

  return (
    <div className="container-fluid">
      <style>{`
        .widget-grid{display:grid;gap:24px;margin-bottom:24px}
        .widget-card{background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:20px;transition:box-shadow .2s}
        .widget-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.12)}
        .widget-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .widget-title{font-size:1rem;font-weight:600;margin:0}
        .widget-icon{display:flex;align-items:center;justify-content:center;border-radius:8px;flex-shrink:0}
        .notification-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px;flex-shrink:0}
        .notification-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px}
        .timeline{position:relative;padding-left:20px}
        .timeline::before{content:'';position:absolute;left:5px;top:6px;bottom:6px;width:2px;background:#e5e7eb}
        .timeline-item{position:relative;padding-bottom:16px;padding-left:20px}
        .timeline-item:last-child{padding-bottom:0}
        .timeline-marker{position:absolute;left:-16px;top:4px;width:12px;height:12px;border-radius:50%;border:2px solid #fff;z-index:1}
        .timeline-content .small{margin-bottom:2px}
        .cal-dot{width:4px;height:4px;border-radius:50%;position:absolute;bottom:0;left:50%;transform:translateX(-50%)}
        [dir="rtl"] .timeline{padding-left:0;padding-right:20px}
        [dir="rtl"] .timeline::before{left:auto;right:5px}
        [dir="rtl"] .timeline-item{padding-left:0;padding-right:20px}
        [dir="rtl"] .timeline-marker{left:auto;right:-16px}
      `}</style>

      <div className="mb-4">
        <h1 className="h3 fw-bold">{t('widgets.title')}</h1>
        <p className="text-muted">{t('widgets.subtitle')}</p>
      </div>

      {/* Statistics Widgets */}
      <section aria-labelledby="stat-widgets-heading">
        <h2 id="stat-widgets-heading" className="h5 fw-semibold mb-4">{t('widgets.statistics')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {statWidgets.map(w => (
            <div className="widget-card" key={w.label}>
              <div className="d-flex align-items-center">
                <div className={`widget-icon me-3 bg-${w.bg} bg-opacity-10 text-${w.bg}`} style={{ width: 48, height: 48, fontSize: 20 }}>
                  <i className={`bi bi-${w.icon}`}></i>
                </div>
                <div>
                  <div className="text-muted small">{w.label}</div>
                  <div className="h4 fw-bold mb-0">{w.value}</div>
                  <small className={w.up === true ? 'text-success' : w.up === false ? 'text-danger' : 'text-muted'}>
                    {w.up === true && <i className="bi bi-arrow-up"></i>}
                    {w.up === false && <i className="bi bi-arrow-down"></i>}
                    {w.up === null && <i className="bi bi-dash-lg"></i>}
                    {' '}{w.change} <span className="text-muted">{t('widgets.fromLastMonth')}</span>
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Progress Widgets */}
      <section aria-labelledby="progress-widgets-heading">
        <h2 id="progress-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.progress')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Course Completion */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.courseCompletion')}</h3>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {t('widgets.thisMonth')}
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('widgets.thisWeek')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('widgets.thisMonth')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('widgets.thisYear')}</a></li>
                </ul>
              </div>
            </div>
            {progressSubjects.map(p => (
              <div className="mb-3" key={p.label}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-sm">{p.label}</span>
                  <span className="text-sm fw-medium">{p.pct}%</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div className={`progress-bar bg-${p.color}`} role="progressbar" style={{ width: `${p.pct}%` }} aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
              </div>
            ))}
          </div>
          {/* Assignment Submissions */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.assignmentSubmissions')}</h3>
              <span className="badge bg-primary">{t('widgets.dueToday')}</span>
            </div>
            {assignments.map(a => (
              <div className="mb-3" key={a.label}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-sm">{a.label}</span>
                  <span className="text-sm fw-medium">{a.count}</span>
                </div>
                <div className="progress" style={{ height: 10 }}>
                  <div className={`progress-bar bg-${a.color}`} role="progressbar" style={{ width: `${a.pct}%` }} aria-valuenow={a.pct} aria-valuemin={0} aria-valuemax={100}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Profile Widgets */}
      <section aria-labelledby="profile-widgets-heading">
        <h2 id="profile-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.userProfiles')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Student Profile */}
          <div className="widget-card text-center">
            <div className="position-relative mb-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces" alt="Student" className="rounded-circle mb-3" width="80" height="80" loading="lazy" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ [isRtl ? 'left' : 'right']: 'auto', [isRtl ? 'right' : 'left']: undefined }}>
                <i className="bi bi-check"></i>
              </span>
            </div>
            <h4 className="fw-semibold mb-1">{t('widgets.studentName')}</h4>
            <p className="text-muted mb-2">{t('widgets.studentProfile')}</p>
            <p className="text-muted small mb-3">{t('widgets.classOf')} 2025 &bull; {t('widgets.gpa')}: 3.8</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <button className="btn btn-primary btn-sm"><i className="bi bi-envelope me-1"></i> {t('widgets.message')}</button>
              <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-person-plus me-1"></i> {t('widgets.follow')}</button>
            </div>
            <div className="row text-center">
              <div className="col-4"><div className="fw-bold text-primary">24</div><div className="small text-muted">{t('widgets.courses')}</div></div>
              <div className="col-4"><div className="fw-bold text-success">3.8</div><div className="small text-muted">{t('widgets.gpa')}</div></div>
              <div className="col-4"><div className="fw-bold text-warning">12</div><div className="small text-muted">{t('widgets.credits')}</div></div>
            </div>
          </div>
          {/* Professor Profile */}
          <div className="widget-card text-center">
            <div className="position-relative mb-3">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces" alt="Professor" className="rounded-circle mb-3" width="80" height="80" loading="lazy" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning" style={{ [isRtl ? 'left' : 'right']: 'auto', [isRtl ? 'right' : 'left']: undefined }}>
                <i className="bi bi-star"></i>
              </span>
            </div>
            <h4 className="fw-semibold mb-1">{t('widgets.professorName')}</h4>
            <p className="text-muted mb-2">{t('widgets.professorProfile')}</p>
            <p className="text-muted small mb-3">{t('widgets.professorExp')}</p>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <button className="btn btn-primary btn-sm"><i className="bi bi-calendar me-1"></i> {t('widgets.schedule')}</button>
              <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-star me-1"></i> {t('widgets.rate')}</button>
            </div>
            <div className="row text-center">
              <div className="col-4"><div className="fw-bold text-primary">12</div><div className="small text-muted">{t('widgets.courses')}</div></div>
              <div className="col-4"><div className="fw-bold text-success">4.7</div><div className="small text-muted">{t('widgets.rating')}</div></div>
              <div className="col-4"><div className="fw-bold text-warning">340</div><div className="small text-muted">{t('widgets.students')}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar & Events Widgets */}
      <section aria-labelledby="calendar-widgets-heading">
        <h2 id="calendar-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.calendarEvents')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Mini Calendar */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.september')} 2025</h3>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" aria-label="Previous month"><i className="bi bi-chevron-left"></i></button>
                <button className="btn btn-sm btn-outline-secondary" aria-label="Next month"><i className="bi bi-chevron-right"></i></button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-sm text-center mb-0">
                <thead>
                  <tr>{dayNames.map(d => <th key={d} className="border-0 text-muted small py-1">{d}</th>)}</tr>
                </thead>
                <tbody>
                  {calendarDays.map((week, wi) => (
                    <tr key={wi}>
                      {week.map((d, di) => {
                        const isPrevNext = (wi === 0 && di < 1) || (wi === 4 && di > 2);
                        const isToday = d === 22 && wi === 3 && di === 0;
                        const hasEvent = (d === 15 && wi === 2 && di === 1) || (d === 22 && wi === 3 && di === 0) || (d === 24 && wi === 3 && di === 3);
                        const eventColor = d === 15 ? '#0d6efd' : d === 24 ? '#198754' : '#0d6efd';
                        return (
                          <td key={di} className={`border-0 py-1 ${isPrevNext ? 'text-muted' : ''} ${isToday ? 'bg-primary text-white rounded' : ''} ${hasEvent && !isToday ? 'position-relative' : ''}`}>
                            {d}
                            {hasEvent && !isToday && <div className="cal-dot" style={{ background: eventColor }}></div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Upcoming Events */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.upcomingEvents')}</h3>
              <button className="btn btn-sm btn-primary"><i className="bi bi-plus"></i> {t('widgets.addEvent')}</button>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {events.map((e, i) => (
                <div className="d-flex align-items-start mb-3" key={i}>
                  <div className="text-center me-3" style={{ minWidth: 50 }}>
                    <div className="small text-muted">{e.month}</div>
                    <div className={`h5 fw-bold text-${e.color} mb-0`}>{e.day}</div>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold mb-1">{e.title}</h6>
                    <p className="text-muted small mb-1">{e.location}</p>
                    <small className="text-muted"><i className="bi bi-clock"></i> {e.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Utility Widgets */}
      <section aria-labelledby="utility-widgets-heading">
        <h2 id="utility-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.utility')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Today's Tasks */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.todaysTasks')}</h3>
              <span className="badge bg-primary">{tasks.filter(t => !t.done).length} {t('widgets.pending')}</span>
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {tasks.map((task, i) => (
                <div className="form-check mb-2" key={i}>
                  <input className="form-check-input" type="checkbox" defaultChecked={task.done} id={`task${i}`} />
                  <label className={`form-check-label ${task.done ? 'text-decoration-line-through text-muted' : ''}`} htmlFor={`task${i}`}>
                    {task.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button className="btn btn-outline-primary btn-sm w-100"><i className="bi bi-plus"></i> {t('widgets.addNewTask')}</button>
            </div>
          </div>
          {/* Weather Widget */}
          <div className="widget-card text-center">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.todaysWeather')}</h3>
              <small className="text-muted">{t('widgets.newYork')}</small>
            </div>
            <div className="mb-3"><i className="bi bi-sun" style={{ fontSize: '3rem', color: '#ffc107' }}></i></div>
            <div className="h2 fw-bold mb-1">72&deg;F</div>
            <p className="text-muted mb-3">{t('widgets.sunny')}</p>
            <div className="row text-center">
              <div className="col-4"><div className="small text-muted">{t('widgets.humidity')}</div><div className="fw-semibold">45%</div></div>
              <div className="col-4"><div className="small text-muted">{t('widgets.wind')}</div><div className="fw-semibold">8 mph</div></div>
              <div className="col-4"><div className="small text-muted">{t('widgets.uvIndex')}</div><div className="fw-semibold">6</div></div>
            </div>
            <hr />
            <div className="d-flex justify-content-between text-center">
              <div><div className="small text-muted">{t('widgets.tomorrow')}</div><i className="bi bi-cloud-sun text-warning"></i><div className="small fw-semibold">69&deg;F</div></div>
              <div><div className="small text-muted">{t('widgets.tuesday')}</div><i className="bi bi-cloud-rain text-primary"></i><div className="small fw-semibold">65&deg;F</div></div>
              <div><div className="small text-muted">{t('widgets.wednesday')}</div><i className="bi bi-sun text-warning"></i><div className="small fw-semibold">74&deg;F</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & Quick Actions */}
      <section aria-labelledby="social-widgets-heading">
        <h2 id="social-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.socialMedia')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Social Feed */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.socialActivity')}</h3>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {t('widgets.allPlatforms')}
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">{t('widgets.facebook')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('widgets.twitter')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('widgets.linkedin')}</a></li>
                  <li><a className="dropdown-item" href="#">{t('widgets.instagram')}</a></li>
                </ul>
              </div>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {socialFeed.map((s, i) => (
                <div className="d-flex align-items-start mb-3" key={i}>
                  <div className={`widget-icon bg-${s.bg} bg-opacity-10 text-${s.bg} me-3`} style={{ width: 32, height: 32, fontSize: 14 }}>
                    <i className={`bi bi-${s.icon}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="small fw-semibold">{s.title}</div>
                    <div className="small text-muted">{s.desc}</div>
                    <div className="small text-muted">{s.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Quick Actions */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.quickActions')}</h3>
              <small className="text-muted">{t('widgets.commonTasks')}</small>
            </div>
            <div className="row g-2">
              {quickActions.map((a, i) => (
                <div className="col-6" key={i}>
                  <button className={`btn btn-outline-${a.color} w-100 d-flex flex-column align-items-center py-3`}>
                    <i className={`bi bi-${a.icon}`} style={{ fontSize: '1.5rem' }}></i>
                    <span className="mt-2 small">{a.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chart Widgets */}
      <section aria-labelledby="chart-widgets-heading">
        <h2 id="chart-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.charts')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {/* Enrollment Trend */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.weeklyEnrollment')}</h3>
              <span className="badge bg-success">+15%</span>
            </div>
            <div style={{ height: 120 }}><canvas ref={enrollmentRef}></canvas></div>
            <div className="text-center mt-2"><small className="text-muted">{t('widgets.last7Days')}</small></div>
          </div>
          {/* Grade Distribution */}
          <div className="widget-card text-center">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.gradeDistribution')}</h3>
              <div className="dropdown">
                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">CS101</button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">CS101</a></li>
                  <li><a className="dropdown-item" href="#">MATH201</a></li>
                  <li><a className="dropdown-item" href="#">PHY301</a></li>
                </ul>
              </div>
            </div>
            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><canvas ref={gradeRef}></canvas></div>
            <div className="row text-center mt-2">
              <div className="col-3"><div className="small" style={{ color: '#0d6efd' }}>&#9632;</div><div className="small">A</div></div>
              <div className="col-3"><div className="small" style={{ color: '#198754' }}>&#9632;</div><div className="small">B</div></div>
              <div className="col-3"><div className="small" style={{ color: '#ffc107' }}>&#9632;</div><div className="small">C</div></div>
              <div className="col-3"><div className="small" style={{ color: '#dc3545' }}>&#9632;</div><div className="small">D/F</div></div>
            </div>
          </div>
          {/* Department Revenue */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.deptRevenue')}</h3>
              <span className="text-success small"><i className="bi bi-arrow-up"></i> 8.3%</span>
            </div>
            <div style={{ height: 120 }}><canvas ref={revenueRef}></canvas></div>
            <div className="text-center mt-2"><small className="text-muted">{t('widgets.thisVsLast')}</small></div>
          </div>
        </div>
      </section>

      {/* Notifications & Timeline */}
      <section aria-labelledby="notification-widgets-heading">
        <h2 id="notification-widgets-heading" className="h5 fw-semibold mb-4 mt-5">{t('widgets.notificationsTimeline')}</h2>
        <div className="widget-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Recent Notifications */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.recentNotifications')}</h3>
              <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-bell-slash"></i> {t('widgets.markAllRead')}</button>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {notifications.map((n, i) => (
                <div className="d-flex align-items-start mb-3" key={i}>
                  <div className={`notification-icon bg-${n.bg} bg-opacity-10 text-${n.bg} me-3`}>
                    <i className={`bi bi-${n.icon}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="small fw-semibold">{n.title}</div>
                    <div className="small text-muted">{n.desc}</div>
                    <div className="small text-muted">{n.time}</div>
                  </div>
                  {n.dot && <div className={`notification-dot bg-${n.bg}`}></div>}
                </div>
              ))}
            </div>
          </div>
          {/* Activity Timeline */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">{t('widgets.activityTimeline')}</h3>
              <small className="text-muted">{t('widgets.todaysActivity')}</small>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <div className="timeline">
                {timeline.map((t, i) => (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-marker bg-${t.marker}`}></div>
                    <div className="timeline-content">
                      <div className="small fw-semibold">{t.title}</div>
                      <div className="small text-muted">{t.desc}</div>
                      <div className="small text-muted">{t.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
