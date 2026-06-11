'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './admin.css';
import { AdminLangProvider, useAdminLang } from './admin-lang-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLangProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t, dir } = useAdminLang();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    if (!token) { router.push('/login'); return; }
    const u = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    if (u) setUser(u);
    try {
      const raw = localStorage.getItem('admin_permissions') || sessionStorage.getItem('admin_permissions') || '[]';
      const p = JSON.parse(raw);
      setPermissions(Array.isArray(p) ? p : []);
    } catch { setPermissions([]); }
  }, []);

  const can = (perm: string) => permissions.length === 0 || permissions.includes('system') || permissions.includes(perm);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, [dir, lang]);

  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar');
    if (saved === 'collapsed') setCollapsed(true);
  }, []);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('admin_sidebar', next ? 'collapsed' : 'expanded');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const isExact = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_permissions');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_permissions');
    window.location.href = '/login';
  };

  const sectionTitle = (key: string) => (
    <div className={`menu-section-title ${collapsed ? 'd-none' : ''}`}>{t(key)}</div>
  );

  const directLink = (href: string, icon: string, labelKey: string, external?: boolean) => (
    <li className="nav-item">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="nav-link">
          <i className={`bi bi-${icon}`}></i>
          <span>{t(labelKey)}</span>
        </a>
      ) : (
        <Link href={href} className={`nav-link ${isExact(href) ? 'active' : ''}`}>
          <i className={`bi bi-${icon}`}></i>
          <span>{t(labelKey)}</span>
        </Link>
      )}
    </li>
  );

  const submenuParent = (id: string, icon: string, labelKey: string, items: { href: string; labelKey: string; external?: boolean }[]) => {
    const isAnyActive = items.some(i => !i.external && isActive(i.href));
    const isOpen = openSubmenus[id] ?? isAnyActive;
    return (
      <li className="nav-item">
        <a className={`nav-link has-submenu ${isAnyActive ? 'active' : ''} ${isOpen ? 'expanded' : ''}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setOpenSubmenus(prev => ({ ...prev, [id]: !prev[id] }));
          }}>
          <i className={`bi bi-${icon}`}></i>
          <span>{t(labelKey)}</span>
        </a>
        <ul id={id} className={`submenu list-unstyled ${isOpen ? 'show' : ''}`}>
          {items.map(item => (
            <li key={item.href}>
              {item.external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="nav-link">{t(item.labelKey)}</a>
              ) : (
                <Link href={item.href} className={`nav-link ${isExact(item.href) ? 'active' : ''}`}>{t(item.labelKey)}</Link>
              )}
            </li>
          ))}
        </ul>
      </li>
    );
  };

  const breadcrumbMap: Record<string, string> = {
    '/admin': 'sidebar.dashboard.v1',
    '/admin/dashboard-1': 'sidebar.dashboard.v2',
    '/admin/dashboard-2': 'sidebar.dashboard.v3',
    '/admin/analytics': 'sidebar.analytics',
    '/admin/widgets': 'sidebar.widgets',
    '/admin/events': 'sidebar.events',
    '/admin/students': 'sidebar.students.all',
    '/admin/students/add': 'sidebar.students.add',
    '/admin/students/edit': 'sidebar.students.edit',
    '/admin/students/profile': 'sidebar.students.profile',
    '/admin/professors': 'sidebar.professors.all',
    '/admin/courses': 'sidebar.courses.all',
    '/admin/courses/edit': 'sidebar.courses.edit',
    '/admin/courses/info': 'sidebar.courses.info',
    '/admin/courses/payment': 'sidebar.courses.payment',
    '/admin/library': 'sidebar.library.assets',
    '/admin/library/edit': 'sidebar.library.edit',
    '/admin/departments': 'sidebar.departments.list',
    '/admin/tuition-fees': 'sidebar.tuitionFees.style',
    '/admin/mailbox': 'sidebar.mailbox.inbox',
    '/admin/mailbox/compose': 'sidebar.mailbox.compose',
    '/admin/mailbox/view': 'sidebar.mailbox.view',
    '/admin/site': 'sidebar.siteinfo',
    '/admin/topbar': 'sidebar.topbar',
    '/admin/nav': 'sidebar.navigation',
    '/admin/hero': 'sidebar.heroslider',
    '/admin/quicklinks': 'sidebar.quicklinks',
    '/admin/features': 'sidebar.features',
    '/admin/sidecards': 'sidebar.sidecards',
    '/admin/highlight': 'sidebar.highlight',
    '/admin/news': 'sidebar.news',
    '/admin/footer': 'sidebar.footer',
    '/admin/chat': 'sidebar.chatbot',
    '/admin/admins': 'sidebar.admins',
    '/admin/theme': 'sidebar.theme',
    '/admin/settings': 'sidebar.settings',
    '/admin/templates': 'sidebar.templates',
    '/admin/tools': 'sidebar.codeeditor',
    '/admin/dev/code-editor': 'sidebar.codeeditor',
    '/admin/dev/pdf-viewer': 'sidebar.pdfviewer',
    '/admin/dev/google-map': 'sidebar.googlemap',
    '/admin/dev/data-maps': 'sidebar.datamaps',
  };
  const breadcrumbLabel = t(breadcrumbMap[pathname] || 'sidebar.dashboard.v1');

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <h5><i className="bi bi-mortarboard-fill"></i>كلية الشرق</h5>
          <button className="sidebar-close" id="sidebarClose" onClick={() => setMobileOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <nav className="sidebar-nav">
        {can('dashboard') && (
          <div className="menu-section">
            {sectionTitle('section.main')}
            <ul className="nav flex-column">
              {submenuParent('dashboardSubmenu', 'speedometer2', 'sidebar.dashboard', [
                { href: '/admin', labelKey: 'sidebar.dashboard.v1' },
                { href: '/admin/dashboard-1', labelKey: 'sidebar.dashboard.v2' },
                { href: '/admin/dashboard-2', labelKey: 'sidebar.dashboard.v3' },
                { href: '/admin/analytics', labelKey: 'sidebar.analytics' },
                { href: '/admin/widgets', labelKey: 'sidebar.widgets' },
              ])}
              {can('events') && directLink('/admin/events', 'calendar-event', 'sidebar.events')}
            </ul>
          </div>
        )}
        {(can('professors') || can('students') || can('courses') || can('library') || can('departments')) && (
          <div className="menu-section">
            {sectionTitle('section.academic')}
            <ul className="nav flex-column">
              {can('professors') && submenuParent('professorsSubmenu', 'person-badge', 'sidebar.professors', [
                { href: '/admin/professors', labelKey: 'sidebar.professors.all' },
                { href: '/admin/professors/add', labelKey: 'sidebar.professors.add' },
                { href: '/admin/professors/edit', labelKey: 'sidebar.professors.edit' },
                { href: '/admin/professors/profile', labelKey: 'sidebar.professors.profile' },
              ])}
              {can('students') && submenuParent('studentsSubmenu', 'people', 'sidebar.students', [
                { href: '/admin/students', labelKey: 'sidebar.students.all' },
                { href: '/admin/students/add', labelKey: 'sidebar.students.add' },
                { href: '/admin/students/edit', labelKey: 'sidebar.students.edit' },
                { href: '/admin/students/profile', labelKey: 'sidebar.students.profile' },
              ])}
              {can('courses') && submenuParent('coursesSubmenu', 'book', 'sidebar.courses', [
                { href: '/admin/courses', labelKey: 'sidebar.courses.all' },
                { href: '/admin/courses/add', labelKey: 'sidebar.courses.add' },
                { href: '/admin/courses/edit', labelKey: 'sidebar.courses.edit' },
                { href: '/admin/courses/info', labelKey: 'sidebar.courses.info' },
                { href: '/admin/courses/payment', labelKey: 'sidebar.courses.payment' },
              ])}
              {can('library') && submenuParent('librarySubmenu', 'journal-bookmark', 'sidebar.library', [
                { href: '/admin/library', labelKey: 'sidebar.library.assets' },
                { href: '/admin/library/add', labelKey: 'sidebar.library.add' },
                { href: '/admin/library/edit', labelKey: 'sidebar.library.edit' },
              ])}
              {can('departments') && submenuParent('departmentsSubmenu', 'building', 'sidebar.departments', [
                { href: '/admin/departments', labelKey: 'sidebar.departments.list' },
                { href: '/admin/departments/add', labelKey: 'sidebar.departments.add' },
                { href: '/admin/tuition-fees', labelKey: 'sidebar.tuitionFees.style' },
              ])}
            </ul>
          </div>
        )}
        {can('mailbox') && (
          <div className="menu-section">
            {sectionTitle('section.communication')}
            <ul className="nav flex-column">
              {submenuParent('mailboxSubmenu', 'envelope', 'sidebar.mailbox', [
                { href: '/admin/mailbox', labelKey: 'sidebar.mailbox.inbox' },
                { href: '/admin/mailbox/compose', labelKey: 'sidebar.mailbox.compose' },
                { href: '/admin/mailbox/view', labelKey: 'sidebar.mailbox.view' },
              ])}
            </ul>
          </div>
        )}
        {can('developer') && (
          <div className="menu-section">
            {sectionTitle('section.interface')}
            <ul className="nav flex-column">
            </ul>
          </div>
        )}
        {can('developer') && (
          <div className="menu-section">
            {sectionTitle('section.developer')}
            <ul className="nav flex-column">
              {directLink('/admin/dev/code-editor', 'code-slash',   'sidebar.codeeditor')}
              {directLink('/admin/dev/pdf-viewer',  'filetype-pdf', 'sidebar.pdfviewer')}
              {directLink('/admin/dev/google-map',  'geo-alt',      'sidebar.googlemap')}
              {directLink('/admin/dev/data-maps',   'map',          'sidebar.datamaps')}
            </ul>
          </div>
        )}
        {can('developer') && (
          <div className="menu-section">
            {sectionTitle('section.pages')}
            <ul className="nav flex-column">
            </ul>
          </div>
        )}
        {can('content') && (
          <div className="menu-section">
            {sectionTitle('section.content')}
            <ul className="nav flex-column">
              {directLink('/admin/site', 'globe', 'sidebar.siteinfo')}
              {directLink('/admin/topbar', 'layout-text-window', 'sidebar.topbar')}
              {directLink('/admin/nav', 'list', 'sidebar.navigation')}
              {directLink('/admin/hero', 'images', 'sidebar.heroslider')}
              {directLink('/admin/quicklinks', 'link-45deg', 'sidebar.quicklinks')}
              {directLink('/admin/features', 'star', 'sidebar.features')}
              {directLink('/admin/sidecards', 'card-list', 'sidebar.sidecards')}
              {directLink('/admin/highlight', 'lightbulb', 'sidebar.highlight')}
              {directLink('/admin/news', 'newspaper', 'sidebar.news')}
              {directLink('/admin/footer', 'heart', 'sidebar.footer')}
              {directLink('/admin/contacts', 'envelope', 'sidebar.contacts')}
              {directLink('/admin/chat', 'robot', 'sidebar.chatbot')}
            </ul>
          </div>
        )}
        {can('system') && (
          <div className="menu-section">
            {sectionTitle('section.system')}
            <ul className="nav flex-column">
              {directLink('/admin/admins', 'shield-lock', 'sidebar.admins')}
              {directLink('/admin/settings', 'gear', 'sidebar.settings')}
            </ul>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <div dir={dir}>
      <style>{`
        html{direction:${dir}!important}
        .submenu .nav-link{padding-${dir === 'rtl' ? 'right' : 'left'}:3rem!important}
        .sidebar-nav .nav-link.has-submenu::after{${dir === 'rtl' ? 'left' : 'right'}:1rem!important}
        [dir="rtl"] .sidebar-nav .nav-link{text-align:right!important}
        [dir="rtl"] .submenu .nav-link{padding-right:3rem!important;padding-left:0.75rem!important}
        [dir="rtl"] .top-navbar .breadcrumb-item+.breadcrumb-item::before{float:right!important}
        [dir="rtl"] .me-2{margin-right:0!important;margin-left:0.5rem!important}
        [dir="rtl"] .me-3{margin-right:0!important;margin-left:1rem!important}
        [dir="rtl"] .ms-1{margin-left:0!important;margin-right:0.25rem!important}
        [dir="rtl"] .ms-3{margin-left:0!important;margin-right:1rem!important}
        [dir="rtl"] .ms-auto{margin-left:0!important;margin-right:auto!important}
        [dir="rtl"] .dropdown-menu-end{left:0!important;right:auto!important}
        [dir="rtl"] .translate-middle{transform:translate(50%,-50%)!important}
        [dir="rtl"] .start-100{left:auto!important;right:100%!important}
        [dir="rtl"] .sidebar{left:auto!important;right:0!important}
        [dir="rtl"] .main-wrapper{margin-left:0!important;margin-right:var(--sidebar-width)!important}
        [dir="rtl"] .main-wrapper.full-width{margin-right:70px!important}
        [dir="rtl"] .dashboard-card-header .dropdown-menu{left:0!important;right:auto!important}
      `}</style>
      <div className="search-backdrop" id="searchBackdrop"></div>
      <div className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)}></div>
      <aside dir={dir} className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'active' : ''}`} id="sidebar">
        {sidebarContent}
      </aside>
      <div className={`main-wrapper ${collapsed ? 'full-width' : ''}`}>
        <nav className="navbar top-navbar">
          <div className="container-fluid d-flex align-items-center h-100">
            <button className="hamburger-menu" id="sidebarToggle" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <nav aria-label="breadcrumb" className="d-none d-lg-block ms-3">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/admin">{t('header.home')}</Link></li>
                <li className="breadcrumb-item active">{breadcrumbLabel}</li>
              </ol>
            </nav>
            <div className="navbar-brand d-lg-none fw-bold me-auto">كلية الشرق</div>
            <div className="flex-grow-1 d-none d-lg-block"></div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-light btn-icon" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} title={t('lang.switch')}>
                <i className="bi bi-translate"></i>
              </button>
              <div className="search-container d-none d-md-block">
                <button className="btn btn-light btn-icon" id="searchToggle">
                  <i className="bi bi-search"></i>
                </button>
              </div>
              <div className="dropdown">
                <button className="btn btn-light btn-icon position-relative" data-bs-toggle="dropdown">
                  <i className="bi bi-bell"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>3</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{ width: 320 }}>
                  <li className="dropdown-header d-flex align-items-center justify-content-between">
                    <span>{t('header.notifications')}</span>
                    <small className="text-muted">3 {t('header.new')}</small>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item py-2" href="#"><div className="d-flex align-items-center"><div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3" style={{ width: 40, height: 40 }}><i className="bi bi-calendar-check text-primary"></i></div><div className="flex-grow-1"><div className="fw-semibold">{t('notif.newevent')}</div><div className="text-muted small">{t('notif.newevent.desc')}</div><div className="text-muted small">{t('notif.newevent.time')}</div></div></div></a></li>
                  <li><a className="dropdown-item py-2" href="#"><div className="d-flex align-items-center"><div className="rounded-circle bg-success bg-opacity-10 p-2 me-3" style={{ width: 40, height: 40 }}><i className="bi bi-check-circle text-success"></i></div><div className="flex-grow-1"><div className="fw-semibold">{t('notif.assignment')}</div><div className="text-muted small">{t('notif.assignment.desc')}</div><div className="text-muted small">{t('notif.assignment.time')}</div></div></div></a></li>
                  <li><a className="dropdown-item py-2" href="#"><div className="d-flex align-items-center"><div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3" style={{ width: 40, height: 40 }}><i className="bi bi-exclamation-triangle text-warning"></i></div><div className="flex-grow-1"><div className="fw-semibold">{t('notif.alert')}</div><div className="text-muted small">{t('notif.alert.desc')}</div><div className="text-muted small">{t('notif.alert.time')}</div></div></div></a></li>
                  <li><hr className="dropdown-divider" /></li>
                </ul>
              </div>
              <div className="dropdown">
                <button className="btn btn-light btn-icon" data-bs-toggle="dropdown">
                  <i className="bi bi-plus-lg"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" href="/admin/students"><i className="bi bi-person-plus me-2"></i>{t('header.addstudent')}</Link></li>
                  <li><Link className="dropdown-item" href="/admin/courses/add"><i className="bi bi-book me-2"></i>{t('header.addcourse')}</Link></li>
                  <li><Link className="dropdown-item" href="/admin/professors/add"><i className="bi bi-person-badge me-2"></i>{t('header.addprofessor')}</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/admin/events"><i className="bi bi-calendar-plus me-2"></i>{t('header.scheduleevent')}</a></li>
                </ul>
              </div>
              <Link href="/" className="btn btn-light btn-icon d-none d-md-block" target="_blank" title={t('header.viewsite')}>
                <i className="bi bi-box-arrow-up-right"></i>
              </Link>
              <div className="dropdown">
                <button className="btn btn-light d-flex align-items-center" data-bs-toggle="dropdown">
                  <div className="user-avatar me-2">
                    <img src={`https://ui-avatars.com/api/?name=${user || t('layout.admin')}&background=6366f1&color=fff&size=32`} alt="Avatar" width="32" height="32" className="rounded-circle" />
                  </div>
                  <span className="d-none d-md-inline">{user || t('layout.admin')}</span>
                  <i className="bi bi-chevron-down ms-1"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>{t('header.profile')}</a></li>
                  <li><Link className="dropdown-item" href="/admin/settings"><i className="bi bi-gear me-2"></i>{t('header.settings')}</Link></li>
                  <li><Link className="dropdown-item" href="/admin/templates"><i className="bi bi-question-circle me-2"></i>{t('header.help')}</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>{t('header.logout')}</button></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
        <main className="dashboard-content" id="main-content">{children}</main>
        <footer className="dashboard-footer">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-0">&copy; {new Date().getFullYear()} كلية الشرق. {t('footer.copyright')}</p>
              </div>
              <div className="col-md-6 text-md-end">
                <p className="mb-0">{t('footer.built')} <i className="bi bi-heart-fill text-danger"></i> {t('layout.forEducation')}</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
