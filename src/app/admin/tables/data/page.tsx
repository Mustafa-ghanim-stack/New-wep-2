'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

const allData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
  { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'Viewer', status: 'Active' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'Inactive' },
  { id: 8, name: 'Henry Clark', email: 'henry@example.com', role: 'Viewer', status: 'Active' },
  { id: 9, name: 'Ivy Martinez', email: 'ivy@example.com', role: 'Admin', status: 'Active' },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'Inactive' },
  { id: 11, name: 'Karen Thomas', email: 'karen@example.com', role: 'Viewer', status: 'Active' },
  { id: 12, name: 'Leo Garcia', email: 'leo@example.com', role: 'Editor', status: 'Active' },
];

const pageSize = 5;

export default function DataTablePage() {
  const { t } = useAdminLang();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const filtered = allData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.tables.data')}</h1><p className="text-muted text-sm mb-0">{t('ui.tables.data.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">Users Table</h5>
          <input className="form-control form-control-sm" style={{width:250}} placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {paged.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td className="fw-medium">{d.name}</td>
                  <td className="text-muted">{d.email}</td>
                  <td><span className="badge bg-secondary">{d.role}</span></td>
                  <td><span className={`badge bg-${d.status === 'Active' ? 'success' : 'danger'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</small>
          <nav><ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page - 1)}>Previous</button></li>
            {Array.from({length: totalPages}, (_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(page + 1)}>Next</button></li>
          </ul></nav>
        </div>
      </div></div>
    </div>
  );
}
