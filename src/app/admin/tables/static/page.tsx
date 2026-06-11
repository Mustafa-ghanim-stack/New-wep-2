'use client';
import { useAdminLang } from '../../admin-lang-context';

export default function StaticTablePage() {
  const { t } = useAdminLang();
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.tables.static')}</h1><p className="text-muted text-sm mb-0">{t('ui.tables.static.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Basic Table</h5>
            <table className="table"><thead><tr><th>#</th><th>First</th><th>Last</th><th>Handle</th></tr></thead><tbody>
              <tr><td>1</td><td>Mark</td><td>Otto</td><td>@mdo</td></tr>
              <tr><td>2</td><td>Jacob</td><td>Thornton</td><td>@fat</td></tr>
              <tr><td>3</td><td>Larry</td><td>Bird</td><td>@twitter</td></tr>
            </tbody></table>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Striped Rows</h5>
            <table className="table table-striped"><thead><tr><th>#</th><th>Name</th><th>Position</th></tr></thead><tbody>
              <tr><td>1</td><td>Alice</td><td>Developer</td></tr><tr><td>2</td><td>Bob</td><td>Designer</td></tr><tr><td>3</td><td>Carol</td><td>Manager</td></tr>
            </tbody></table>
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Bordered Table</h5>
            <table className="table table-bordered"><thead><tr><th>#</th><th>Name</th><th>Position</th></tr></thead><tbody>
              <tr><td>1</td><td>David</td><td>Engineer</td></tr><tr><td>2</td><td>Eve</td><td>Analyst</td></tr><tr><td>3</td><td>Frank</td><td>Tester</td></tr>
            </tbody></table>
          </div></div>
        </div>
        <div className="col-12">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Table with Contextual Classes</h5>
            <table className="table"><thead><tr><th>#</th><th>Column</th><th>Column</th><th>Column</th></tr></thead><tbody>
              <tr className="table-primary"><td>1</td><td>Primary</td><td>Cell</td><td>Cell</td></tr>
              <tr className="table-success"><td>2</td><td>Success</td><td>Cell</td><td>Cell</td></tr>
              <tr className="table-danger"><td>3</td><td>Danger</td><td>Cell</td><td>Cell</td></tr>
              <tr className="table-warning"><td>4</td><td>Warning</td><td>Cell</td><td>Cell</td></tr>
              <tr className="table-info"><td>5</td><td>Info</td><td>Cell</td><td>Cell</td></tr>
            </tbody></table>
          </div></div>
        </div>
      </div>
    </div>
  );
}
