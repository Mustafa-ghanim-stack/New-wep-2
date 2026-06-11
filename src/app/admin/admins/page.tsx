'use client';
import { useEffect, useState } from 'react';
import { useAdminLang } from '../admin-lang-context';

const ALL_PERMISSIONS = [
  'dashboard','events','students','professors','courses',
  'library','departments','mailbox','content','developer','system',
];

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'danger',
  editor: 'primary',
  academic: 'success',
  viewer: 'secondary',
};

const defaultEdit = {
  newUsername: '',
  displayName: '',
  email: '',
  role: 'editor',
  permissions: ['dashboard'] as string[],
  newPassword: '',
};

export default function AdminsPage() {
  const { t } = useAdminLang();
  const getToken = () => typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || ''
    : '';
  const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` });

  const [admins, setAdmins] = useState<any[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Create
  const [newUser, setNewUser] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newDisplay, setNewDisplay] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editUsername, setEditUsername] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(defaultEdit);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const showMsg = (text: string, type: 'success' | 'danger' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const load = async () => {
    const res = await fetch(`/api/auth/admins?token=${getToken()}`);
    const d = await res.json();
    if (d.admins) setAdmins(d.admins);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (a: any) => {
    setEditUsername(a.username);
    setEditForm({
      newUsername: a.username,
      displayName: a.displayName || '',
      email: a.email || '',
      role: a.role || 'editor',
      permissions: a.permissions || ['dashboard'],
      newPassword: '',
    });
  };

  const togglePerm = (perm: string) => {
    setEditForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || !newPass.trim()) return;
    setCreating(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ username: newUser.trim(), password: newPass.trim() }),
    });
    const d = await res.json();
    if (res.ok) {
      // set extra fields immediately after
      await fetch('/api/auth/admins', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({
          username: newUser.trim(),
          displayName: newDisplay.trim(),
          email: newEmail.trim(),
          role: newRole,
          permissions: newRole === 'superadmin' ? ALL_PERMISSIONS : ['dashboard'],
        }),
      });
      setNewUser(''); setNewPass(''); setNewDisplay(''); setNewEmail(''); setNewRole('editor');
      showMsg(t('status.adminCreated'));
      load();
    } else {
      showMsg(d.error || t('err.saveFailed'), 'danger');
    }
    setCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername) return;
    setSaving(true);
    const body: any = {
      username: editUsername,
      newUsername: editForm.newUsername.trim() || editUsername,
      displayName: editForm.displayName,
      email: editForm.email,
      role: editForm.role,
      permissions: editForm.permissions,
    };
    if (editForm.newPassword.trim()) body.newPassword = editForm.newPassword.trim();
    const res = await fetch('/api/auth/admins', { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    const d = await res.json();
    setSaving(false);
    if (res.ok) {
      // if logged-in user changed their own username, update localStorage
      const currentUser = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
      if (currentUser === editUsername && d.newUsername && d.newUsername !== editUsername) {
        localStorage.setItem('admin_user', d.newUsername);
      }
      setEditUsername(null);
      showMsg(t('form.saved') || 'تم الحفظ بنجاح');
      load();
    } else {
      showMsg(d.error || t('err.saveFailed'), 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch('/api/auth/admins', { method: 'DELETE', headers: headers(), body: JSON.stringify({ username: deleteTarget }) });
    setDeleteTarget(null);
    showMsg(t('form.deleted') || 'تم الحذف');
    load();
  };

  return (
    <div className="container-fluid">
      <div className="mb-3">
        <h1 className="h3 font-bold mb-1">{t('system.admins')}</h1>
        <p className="text-muted text-sm mb-0">{t('system.admins.subtitle')}</p>
      </div>

      {msg && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

      {/* Create */}
      <div className="dashboard-card mb-4">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">{t('admins.create')}</h5>
        </div>
        <div className="dashboard-card-body">
          <form onSubmit={handleCreate}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label text-xs text-muted">{t('admins.form.username')} *</label>
                <input className="form-control" value={newUser} onChange={e => setNewUser(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label text-xs text-muted">{t('admins.form.password')} *</label>
                <input className="form-control" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label text-xs text-muted">{t('admins.form.displayName')}</label>
                <input className="form-control" value={newDisplay} onChange={e => setNewDisplay(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label text-xs text-muted">{t('admins.form.email')}</label>
                <input className="form-control" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label text-xs text-muted">{t('admins.form.role')}</label>
                <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="superadmin">{t('admins.role.superadmin')}</option>
                  <option value="editor">{t('admins.role.editor')}</option>
                  <option value="academic">{t('admins.role.academic')}</option>
                  <option value="viewer">{t('admins.role.viewer')}</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100" disabled={creating}>
                  <i className="bi bi-plus-lg me-1"></i>
                  {creating ? (t('form.saving') || 'جارٍ...') : t('admins.btn.create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h5 className="dashboard-card-title">{t('admins.list')}</h5>
        </div>
        <div className="dashboard-card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">#</th>
                  <th>{t('admins.form.displayName')} / {t('admins.form.username')}</th>
                  <th>{t('admins.form.email')}</th>
                  <th>{t('admins.form.role')}</th>
                  <th>{t('admins.form.permissions')}</th>
                  <th>{t('table.actions') || 'الإجراءات'}</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">{t('admins.empty') || 'لا يوجد مشرفون'}</td></tr>
                )}
                {admins.map((a, i) => (
                  <tr key={a.username}>
                    <td className="text-muted ps-4">{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                          <span className="fw-bold text-primary" style={{ fontSize: 16 }}>
                            {(a.displayName || a.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="fw-semibold">{a.displayName || a.username}</div>
                          {a.displayName && <small className="text-muted">@{a.username}</small>}
                        </div>
                      </div>
                    </td>
                    <td><small className="text-muted">{a.email || '—'}</small></td>
                    <td>
                      <span className={`badge bg-${ROLE_COLORS[a.role] || 'secondary'}`}>
                        {t(`admins.role.${a.role}`) || a.role}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(a.permissions || []).slice(0, 3).map((p: string) => (
                          <span key={p} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                            {t(`admins.perm.${p}`) || p}
                          </span>
                        ))}
                        {(a.permissions || []).length > 3 && (
                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            +{(a.permissions || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(a)}>
                          <i className="bi bi-pencil me-1"></i>{t('form.edit') || 'تعديل'}
                        </button>
                        {a.username !== 'admin' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(a.username)}>
                            <i className="bi bi-trash me-1"></i>{t('students.delete') || 'حذف'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editUsername && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>
                  {t('admins.edit.title')} — <span className="text-primary">{editUsername}</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setEditUsername(null)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">

                  {/* Personal Info */}
                  <p className="fw-bold text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('admins.section.info')}
                  </p>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label text-xs text-muted">{t('admins.form.username')}</label>
                      <input
                        className="form-control"
                        value={editForm.newUsername}
                        onChange={e => setEditForm(f => ({ ...f, newUsername: e.target.value }))}
                        required
                        minLength={3}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-xs text-muted">{t('admins.form.displayName')}</label>
                      <input
                        className="form-control"
                        value={editForm.displayName}
                        onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                        placeholder={editUsername || ''}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-xs text-muted">{t('admins.form.email')}</label>
                      <input
                        className="form-control"
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Role & Permissions */}
                  <p className="fw-bold text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('admins.section.access')}
                  </p>
                  <div className="mb-3">
                    <label className="form-label text-xs text-muted">{t('admins.form.role')}</label>
                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={e => {
                        const r = e.target.value;
                        setEditForm(f => ({
                          ...f,
                          role: r,
                          permissions: r === 'superadmin' ? [...ALL_PERMISSIONS] : f.permissions,
                        }));
                      }}
                      disabled={editUsername === 'admin'}
                    >
                      <option value="superadmin">{t('admins.role.superadmin')}</option>
                      <option value="editor">{t('admins.role.editor')}</option>
                      <option value="academic">{t('admins.role.academic')}</option>
                      <option value="viewer">{t('admins.role.viewer')}</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-xs text-muted d-block mb-2">{t('admins.form.permissions')}</label>
                    <div className="row g-2">
                      {ALL_PERMISSIONS.map(perm => (
                        <div className="col-6 col-md-4" key={perm}>
                          <div
                            className={`border rounded p-2 d-flex align-items-center gap-2 cursor-pointer ${editForm.permissions.includes(perm) ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                            style={{ cursor: editUsername === 'admin' ? 'default' : 'pointer' }}
                            onClick={() => editUsername !== 'admin' && togglePerm(perm)}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input m-0 flex-shrink-0"
                              checked={editForm.permissions.includes(perm)}
                              onChange={() => editUsername !== 'admin' && togglePerm(perm)}
                              disabled={editUsername === 'admin'}
                            />
                            <small className="fw-medium">{t(`admins.perm.${perm}`) || perm}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                    {editUsername === 'admin' && (
                      <small className="text-muted mt-2 d-block">
                        <i className="bi bi-lock me-1"></i>
                        المشرف الرئيسي لديه كامل الصلاحيات دائماً
                      </small>
                    )}
                  </div>

                  {/* Password */}
                  <p className="fw-bold text-muted mb-2" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('admins.section.password')}
                  </p>
                  <div>
                    <input
                      className="form-control"
                      type="password"
                      value={editForm.newPassword}
                      onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder={t('admins.pass.leave') || 'اتركها فارغة للإبقاء على كلمة المرور الحالية'}
                    />
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditUsername(null)}>
                    {t('form.cancel') || 'إلغاء'}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <i className="bi bi-check-lg me-1"></i>
                    {saving ? (t('form.saving') || 'جارٍ الحفظ...') : (t('form.save') || 'حفظ')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {t('modal.confirmDelete') || 'تأكيد الحذف'}
                </h5>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  {t('modal.deleteAdminMsg') || 'هل أنت متأكد من حذف'}{' '}
                  <strong className="text-danger">{deleteTarget}</strong>؟
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>
                  {t('form.cancel') || 'إلغاء'}
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i>{t('students.delete') || 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
