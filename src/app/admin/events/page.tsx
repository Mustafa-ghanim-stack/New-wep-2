'use client';
import { useEffect, useState } from 'react';
import { useEntityAPI } from '../components';
import { useAdminLang } from '../admin-lang-context';

const CATEGORIES_AR = ['أكاديمي', 'مهني', 'طلابي', 'ثقافي', 'شبكي', 'آخر'];
const CATEGORIES_EN = ['Academic', 'Professional', 'Student Life', 'Cultural', 'Networking', 'Other'];
const CAT_COLOR: Record<string, string> = {
  'أكاديمي': 'primary', 'Academic': 'primary',
  'مهني': 'success',    'Professional': 'success',
  'طلابي': 'warning',   'Student Life': 'warning',
  'ثقافي': 'secondary', 'Cultural': 'secondary',
  'شبكي': 'info',       'Networking': 'info',
  'آخر': 'dark',        'Other': 'dark',
};
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899'];

const emptyForm = { title: '', date: '', timeStart: '', timeEnd: '', location: '', description: '', category: '', color: '#6366f1', capacity: '', registered: '' };

function getStatus(date: string): 'upcoming' | 'ongoing' | 'completed' {
  if (!date) return 'upcoming';
  const d = new Date(date); const today = new Date();
  today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  if (d < today) return 'completed';
  if (d.getTime() === today.getTime()) return 'ongoing';
  return 'upcoming';
}

function MiniCalendar({ events, lang }: { events: any[], lang: string }) {
  const [cur, setCur] = useState(new Date());
  const y = cur.getFullYear(), m = cur.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  const eventDays = new Set(events.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).map(e => new Date(e.date).getDate()));

  const eventColors: Record<number, string> = {};
  events.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (d.getFullYear() === y && d.getMonth() === m) eventColors[d.getDate()] = e.color || '#6366f1';
  });

  const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthNames = lang === 'ar' ? monthNamesAr : monthNamesEn;
  const daysAr = ['أح','إث','ثل','أر','خم','جم','سب'];
  const daysEn = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const days = lang === 'ar' ? daysAr : daysEn;

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header py-3 px-4 d-flex justify-content-between align-items-center">
        <button className="btn btn-sm btn-light p-1" onClick={() => setCur(new Date(y, m - 1, 1))}><i className={`bi bi-chevron-${lang === 'ar' ? 'right' : 'left'}`}></i></button>
        <h6 className="mb-0">{monthNames[m]} {y}</h6>
        <button className="btn btn-sm btn-light p-1" onClick={() => setCur(new Date(y, m + 1, 1))}><i className={`bi bi-chevron-${lang === 'ar' ? 'left' : 'right'}`}></i></button>
      </div>
      <div className="dashboard-card-body px-3 py-2">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {days.map(d => <div key={d} className="text-center text-muted fw-bold" style={{ fontSize: '0.7rem', padding: '4px 0' }}>{d}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === day;
            const hasEvent = eventDays.has(day);
            const bg = hasEvent ? (eventColors[day] || '#6366f1') : isToday ? '#6366f1' : 'transparent';
            const color = (hasEvent || isToday) ? '#fff' : '#374151';
            return (
              <div key={i} className="text-center rounded" style={{ fontSize: '0.75rem', padding: '3px 0', background: bg, color, fontWeight: isToday ? 700 : 400 }}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { t, lang } = useAdminLang();
  const api = useEntityAPI('events');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = lang === 'ar' ? CATEGORIES_AR : CATEGORIES_EN;

  const load = async () => { setLoading(true); setItems(await api.fetchAll()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0] });
    setEditId(null); setError(''); setShowAdd(true);
  };
  const openEdit = (ev: any) => {
    setForm({ title: ev.title || '', date: ev.date || '', timeStart: ev.timeStart || '', timeEnd: ev.timeEnd || '', location: ev.location || '', description: ev.description || '', category: ev.category || categories[0], color: ev.color || '#6366f1', capacity: ev.capacity || '', registered: ev.registered || '' });
    setEditId(ev.id); setError(''); setShowDetail(false); setShowAdd(true);
  };
  const openDetail = (ev: any) => { setSelectedEvent(ev); setShowDetail(true); };

  const handleSave = async () => {
    if (!form.title) { setError(t('events.form.title')); return; }
    setSaving(true);
    const res = editId ? await api.update(editId, form) : await api.add(form);
    setSaving(false);
    if (res.ok) { setShowAdd(false); load(); }
    else setError(res.error || t('common.savefail') || 'Save failed');
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('events.delete.confirm'))) return;
    setShowDetail(false);
    await api.remove(id); load();
  };

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcomingCount = items.filter(e => e.date && new Date(e.date) >= now).length;
  const ongoingCount = items.filter(e => { if (!e.date) return false; const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === now.getTime(); }).length;
  const totalRegistered = items.reduce((s, e) => s + (parseInt(e.registered) || 0), 0);

  const formatDate = (d: string) => {
    if (!d) return { mon: '---', day: '--' };
    const dt = new Date(d);
    const monsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const monsEn = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return { mon: (lang === 'ar' ? monsAr : monsEn)[dt.getMonth()], day: String(dt.getDate()).padStart(2, '0') };
  };

  const statusKey: Record<string, string> = { upcoming: 'events.status.upcoming', ongoing: 'events.status.ongoing', completed: 'events.status.completed' };
  const STATUS_COLOR: Record<string, string> = { upcoming: 'info', ongoing: 'success', completed: 'secondary' };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h3 mb-0 font-bold">{t('events.title')}</h1>
          <p className="text-muted mb-0 text-sm">{t('events.subtitle')}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary">
            <i className="bi bi-calendar-month me-1"></i>{t('events.btn.calendar')}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="bi bi-calendar-plus me-1"></i>{t('events.btn.add')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-row">
        <div className="dashboard-grid grid-cols-4">
          {[
            { key: 'events.stat.total',    value: items.length,    icon: 'calendar-event-fill', color: 'primary', sub: t('events.stat.vsmonth'),  badge: 'success', badgeText: '↑ 8%' },
            { key: 'events.stat.upcoming', value: upcomingCount,   icon: 'clock-history',       color: 'info',    sub: t('events.stat.thismonth'), badge: 'info',    badgeText: '📅' },
            { key: 'events.stat.ongoing',  value: ongoingCount,    icon: 'play-circle-fill',    color: 'success', sub: t('events.stat.activenow'), badge: 'success', badgeText: '●' },
            { key: 'events.stat.attendees',value: totalRegistered, icon: 'people-fill',         color: 'warning', sub: t('events.stat.vsmonth'),  badge: 'warning', badgeText: '↑ 23%' },
          ].map(s => (
            <div className="dashboard-card" key={s.key}>
              <div className="dashboard-card-body" style={{ padding: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-muted mb-1 small">{t(s.key)}</p>
                    <h4 className="mb-0">{s.value.toLocaleString()}</h4>
                  </div>
                  <div className={`rounded-circle d-flex align-items-center justify-content-center bg-${s.color} bg-opacity-10 text-${s.color}`} style={{ width: 44, height: 44 }}>
                    <i className={`bi bi-${s.icon}`} style={{ fontSize: 20 }}></i>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <span className={`badge bg-${s.badge}-subtle text-${s.badge} me-2`}>{s.badgeText}</span>
                  <span className="text-muted small">{s.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="dashboard-row">
        <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
          {/* Events List */}
          <div className="dashboard-card">
            <div className="dashboard-card-header py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{t('events.recent')}</h6>
                <div className="dropdown">
                  <button className="btn btn-sm btn-light" data-bs-toggle="dropdown"><i className="bi bi-three-dots"></i></button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a className="dropdown-item" href="#">{t('events.viewall')}</a></li>
                    <li><a className="dropdown-item" href="#">{t('events.export')}</a></li>
                    <li><a className="dropdown-item" href="#">{t('events.filter')}</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="dashboard-card-body p-0">
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border spinner-border-sm"></div></div>
              ) : items.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x" style={{ fontSize: 48 }}></i>
                  <p className="mt-2">{t('events.empty')}</p>
                  <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>{t('events.btn.add')}</button>
                </div>
              ) : items.map((ev, idx) => {
                const { mon, day } = formatDate(ev.date);
                const status = getStatus(ev.date);
                const catColor = CAT_COLOR[ev.category] || 'secondary';
                return (
                  <div key={ev.id} className={`d-flex align-items-center p-4 ${idx < items.length - 1 ? 'border-bottom' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => openDetail(ev)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <div className="text-white rounded text-center me-3 flex-shrink-0" style={{ width: 52, background: ev.color || '#6366f1', padding: '6px 4px' }}>
                      <div style={{ fontSize: lang === 'ar' ? '0.5rem' : '0.65rem', fontWeight: 700 }}>{mon}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{day}</div>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h6 className="mb-1 text-truncate">{ev.title}</h6>
                      {ev.description && <p className="text-muted small mb-2 text-truncate">{ev.description}</p>}
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <span className={`badge bg-${catColor}-subtle text-${catColor}`}>{ev.category}</span>
                        {(ev.timeStart || ev.timeEnd) && (
                          <small className="text-muted"><i className="bi bi-clock me-1"></i>{ev.timeStart}{ev.timeEnd ? ` - ${ev.timeEnd}` : ''}</small>
                        )}
                        {ev.location && <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{ev.location}</small>}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0 ms-3" onClick={e => e.stopPropagation()}>
                      <span className={`badge bg-${STATUS_COLOR[status]}`}>{t(statusKey[status])}</span>
                      {ev.registered && <div className="mt-1"><small className="text-muted">{ev.registered} {t('events.registered.label')}</small></div>}
                      <div className="mt-1 d-flex gap-1 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary p-1" style={{ lineHeight: 1 }} onClick={() => openEdit(ev)}><i className="bi bi-pencil" style={{ fontSize: '0.7rem' }}></i></button>
                        <button className="btn btn-sm btn-outline-danger p-1" style={{ lineHeight: 1 }} onClick={() => handleDelete(ev.id)}><i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="d-flex flex-column gap-4">
            <MiniCalendar events={items} lang={lang} />
            <div className="dashboard-card">
              <div className="dashboard-card-header py-3 px-4"><h6 className="mb-0">{t('events.quickactions')}</h6></div>
              <div className="dashboard-card-body px-4 py-3">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={openAdd}><i className="bi bi-calendar-plus me-1"></i>{t('events.qa.schedule')}</button>
                  <button className="btn btn-outline-success btn-sm"><i className="bi bi-people me-1"></i>{t('events.qa.attendees')}</button>
                  <button className="btn btn-outline-info btn-sm"><i className="bi bi-geo-alt me-1"></i>{t('events.qa.venues')}</button>
                  <button className="btn btn-outline-warning btn-sm"><i className="bi bi-bell me-1"></i>{t('events.qa.reminders')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showDetail && selectedEvent && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) setShowDetail(false); }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: selectedEvent.color || '#6366f1' }}>
                <div className="d-flex align-items-center">
                  <div className="rounded text-center me-3 bg-white p-2" style={{ minWidth: 48, color: selectedEvent.color || '#6366f1' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700 }}>{formatDate(selectedEvent.date).mon}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }}>{formatDate(selectedEvent.date).day}</div>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">{selectedEvent.title}</h5>
                    {(selectedEvent.timeStart || selectedEvent.timeEnd) && (
                      <small className="opacity-75">{selectedEvent.timeStart}{selectedEvent.timeEnd ? ` - ${selectedEvent.timeEnd}` : ''}</small>
                    )}
                  </div>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setShowDetail(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    {selectedEvent.description && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">{t('events.detail.desc')}</h6>
                        <p className="mb-0">{selectedEvent.description}</p>
                      </div>
                    )}
                    <div className="row mb-3">
                      {selectedEvent.location && (
                        <div className="col-sm-6">
                          <h6 className="text-muted mb-2">{t('events.detail.location')}</h6>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-geo-alt me-2" style={{ color: selectedEvent.color || '#6366f1' }}></i>
                            <span>{selectedEvent.location}</span>
                          </div>
                        </div>
                      )}
                      <div className="col-sm-6">
                        <h6 className="text-muted mb-2">{t('events.detail.category')}</h6>
                        <span className={`badge bg-${CAT_COLOR[selectedEvent.category] || 'secondary'}-subtle text-${CAT_COLOR[selectedEvent.category] || 'secondary'}`}>{selectedEvent.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light border-0">
                      <div className="card-header bg-transparent border-0"><h6 className="mb-0">{t('events.detail.status')}</h6></div>
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span>{t('events.detail.regstatus')}</span>
                          <span className={`badge bg-${STATUS_COLOR[getStatus(selectedEvent.date)]}`}>{t(statusKey[getStatus(selectedEvent.date)])}</span>
                        </div>
                        {selectedEvent.capacity && (
                          <>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span>{t('events.detail.registered')}</span>
                              <span className="fw-bold">{selectedEvent.registered || 0} / {selectedEvent.capacity}</span>
                            </div>
                            <div className="progress mb-3" style={{ height: 8 }}>
                              <div className="progress-bar bg-success" style={{ width: `${Math.min(100, ((parseInt(selectedEvent.registered) || 0) / parseInt(selectedEvent.capacity)) * 100)}%` }}></div>
                            </div>
                          </>
                        )}
                        <div className="d-grid gap-2">
                          <button className="btn btn-primary btn-sm"><i className="bi bi-calendar-plus me-1"></i>{t('events.detail.addcal')}</button>
                          <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-share me-1"></i>{t('events.detail.share')}</button>
                          <button className="btn btn-outline-info btn-sm"><i className="bi bi-people me-1"></i>{t('events.detail.viewatt')}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowDetail(false)}>{t('common.close') || 'Close'}</button>
                <button className="btn btn-warning" onClick={() => openEdit(selectedEvent)}><i className="bi bi-pencil me-1"></i>{t('common.edit') || 'Edit'}</button>
                <button className="btn btn-danger" onClick={() => handleDelete(selectedEvent.id)}><i className="bi bi-trash me-1"></i>{t('common.delete') || 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? t('events.modal.edit') : t('events.modal.create')}</h5>
                <button className="btn-close" onClick={() => setShowAdd(false)}></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">{t('events.form.title')}</label>
                    <input className="form-control" value={form.title} onChange={e => setF('title', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('events.form.category')}</label>
                    <select className="form-select" value={form.category} onChange={e => setF('category', e.target.value)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">{t('events.form.desc')}</label>
                    <textarea className="form-control" rows={3} value={form.description} onChange={e => setF('description', e.target.value)}></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('events.form.date')}</label>
                    <input type="date" className="form-control" value={form.date} onChange={e => setF('date', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('events.form.timestart')}</label>
                    <input type="time" className="form-control" value={form.timeStart} onChange={e => setF('timeStart', e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">{t('events.form.timeend')}</label>
                    <input type="time" className="form-control" value={form.timeEnd} onChange={e => setF('timeEnd', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">{t('events.form.location')}</label>
                    <input className="form-control" value={form.location} onChange={e => setF('location', e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">{t('events.form.capacity')}</label>
                    <input type="number" className="form-control" value={form.capacity} onChange={e => setF('capacity', e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">{t('events.form.registered')}</label>
                    <input type="number" className="form-control" value={form.registered} onChange={e => setF('registered', e.target.value)} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">{t('events.form.color')}</label>
                    <div className="d-flex gap-2 flex-wrap mt-1">
                      {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setF('color', c)} className="rounded-circle border-0"
                          style={{ width: 28, height: 28, background: c, outline: form.color === c ? '3px solid #000' : 'none', outlineOffset: 2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowAdd(false)}>{t('common.cancel') || 'Cancel'}</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('common.saving') || 'Saving...'}</> : <><i className="bi bi-check-lg me-1"></i>{t('common.save') || 'Save'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
