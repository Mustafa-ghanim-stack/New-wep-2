'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

interface TreeNode {
  label: string; icon: string; children?: TreeNode[];
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ paddingLeft: depth * 20 }}>
      <div className="d-flex align-items-center py-1" style={{cursor:'pointer'}} onClick={() => hasChildren && setOpen(!open)}>
        {hasChildren && <i className={`bi bi-chevron-${open ? 'down' : 'right'} me-1 small`}></i>}
        {!hasChildren && <span className="me-1" style={{width:12}}></span>}
        <i className={`bi bi-${node.icon} me-2 text-muted`}></i>
        <span>{node.label}</span>
      </div>
      {hasChildren && open && node.children!.map((child, i) => <TreeItem key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function TreeViewPage() {
  const { t } = useAdminLang();
  const treeData: TreeNode[] = [
    { label: 'Dashboard', icon: 'speedometer2', children: [
      { label: 'Analytics', icon: 'graph-up', children: [
        { label: 'Overview', icon: 'eye' },
        { label: 'Reports', icon: 'file-text' },
      ]},
      { label: 'Widgets', icon: 'grid' },
    ]},
    { label: 'Academic', icon: 'book', children: [
      { label: 'Students', icon: 'people', children: [
        { label: 'All Students', icon: 'person' },
        { label: 'Add New', icon: 'person-plus' },
      ]},
      { label: 'Professors', icon: 'person-badge', children: [
        { label: 'All Professors', icon: 'person' },
        { label: 'Add New', icon: 'person-plus' },
      ]},
      { label: 'Courses', icon: 'book' },
    ]},
    { label: 'Settings', icon: 'gear', children: [
      { label: 'System', icon: 'tools' },
      { label: 'Theme', icon: 'palette' },
    ]},
  ];
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.treeview')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.treeview.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <h5 className="fw-semibold mb-3">Navigation Tree</h5>
        {treeData.map((node, i) => <TreeItem key={i} node={node} depth={0} />)}
      </div></div>
    </div>
  );
}
