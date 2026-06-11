'use client';
import { useCallback } from 'react';

export interface TextStyle {
  size?: string;
  font?: string;
  align?: string;
  x?: number;
  y?: number;
}

export function StyleBar({
  label,
  style = {},
  onChange,
}: {
  label?: string;
  style?: TextStyle;
  onChange: (s: TextStyle) => void;
}) {
  const fonts = [
    { value: '', label: 'Default' },
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Tajawal', label: 'Tajawal' },
    { value: 'Noto Sans Arabic', label: 'Noto Sans' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Georgia', label: 'Georgia' },
  ];
  const sizes = ['10','12','14','16','18','20','24','28','32','36','42','48','56','64'];

  const selStyle: React.CSSProperties = {
    height: 28, fontSize: 12, cursor: 'pointer',
    border: '1px solid #ced4da', borderRadius: 4,
    background: 'white', appearance: 'auto' as any,
    padding: '0 4px',
  };

  return (
    <div className="d-flex flex-wrap align-items-center gap-1 p-2 rounded-2 mb-1"
      style={{ background: '#f0f2f5', fontSize: 12 }}>
      {label && <span className="fw-semibold text-muted me-1" style={{ minWidth: 36 }}>{label}</span>}

      {/* Font family */}
      <select style={{ ...selStyle, width: 120 }}
        value={style.font || ''}
        onChange={e => onChange({ ...style, font: e.target.value })}>
        {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* Font size */}
      <select style={{ ...selStyle, width: 80 }}
        value={style.size || ''}
        onChange={e => onChange({ ...style, size: e.target.value })}>
        <option value="">Size</option>
        {sizes.map(s => <option key={s} value={s}>{s}px</option>)}
      </select>

      {/* Alignment */}
      <div className="btn-group" style={{ height: 28 }}>
        {(['left','center','right'] as const).map(a => (
          <button key={a} type="button"
            className={`btn btn-sm px-2 ${style.align === a ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ height: 28, lineHeight: 1 }}
            onClick={() => onChange({ ...style, align: style.align === a ? undefined : a })}>
            <i className={`bi bi-text-${a}`} style={{ fontSize: 11 }}></i>
          </button>
        ))}
      </div>

      {/* X offset */}
      <div className="d-flex align-items-center gap-1">
        <span className="text-muted">←→</span>
        <input type="number" className="form-control form-control-sm py-0"
          style={{ width: 60, height: 28, MozAppearance: 'textfield', fontSize: 12 } as React.CSSProperties}
          placeholder="0"
          value={style.x ?? ''}
          onChange={e => onChange({ ...style, x: e.target.value === '' ? undefined : Number(e.target.value) })}
          onWheel={e => (e.target as HTMLInputElement).blur()} />
      </div>

      {/* Y offset */}
      <div className="d-flex align-items-center gap-1">
        <span className="text-muted">↕</span>
        <input type="number" className="form-control form-control-sm py-0"
          style={{ width: 60, height: 28, MozAppearance: 'textfield', fontSize: 12 } as React.CSSProperties}
          placeholder="0"
          value={style.y ?? ''}
          onChange={e => onChange({ ...style, y: e.target.value === '' ? undefined : Number(e.target.value) })}
          onWheel={e => (e.target as HTMLInputElement).blur()} />
      </div>

      {/* Reset */}
      {(style.size || style.font || style.align || style.x || style.y) && (
        <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2" style={{ height: 28 }}
          onClick={() => onChange({})}>
          <i className="bi bi-x" style={{ fontSize: 11 }}></i>
        </button>
      )}
    </div>
  );
}

export function useAdminAPI() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    : null;

  const fetchContent = useCallback(async () => {
    const res = await fetch(`/api/content?token=${token}`);
    return res.json();
  }, [token]);

  const saveContent = useCallback(async (ar: any, en: any, theme?: any) => {
    const res = await fetch(`/api/content?token=${token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ar, en, ...(theme ? { theme } : {}) }),
    });
    return res.json();
  }, [token]);

  const fetchStudents = useCallback(async () => {
    const res = await fetch(`/api/students?token=${token}`);
    return res.json();
  }, [token]);

  const fetchAdmins = useCallback(async () => {
    const res = await fetch(`/api/auth/admins?token=${token}`);
    return res.json();
  }, [token]);

  return { token, fetchContent, saveContent, fetchStudents, fetchAdmins };
}

export function useEntityAPI(entity: string) {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    : null;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const fetchAll = async () => {
    const res = await fetch(`/api/${entity}?token=${token}`);
    const d = await res.json();
    return d.items || [];
  };
  const add = async (data: any) => {
    const res = await fetch(`/api/${entity}`, { method: 'POST', headers, body: JSON.stringify({ action: 'add', data }) });
    return res.json();
  };
  const update = async (id: string, data: any) => {
    const res = await fetch(`/api/${entity}`, { method: 'POST', headers, body: JSON.stringify({ action: 'update', id, data }) });
    return res.json();
  };
  const remove = async (id: string) => {
    const res = await fetch(`/api/${entity}`, { method: 'POST', headers, body: JSON.stringify({ action: 'delete', id }) });
    return res.json();
  };
  return { fetchAll, add, update, remove };
}

export function EditorCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h5 className="dashboard-card-title">{title}</h5>
        {desc && <p className="text-muted text-sm mb-0 mt-1">{desc}</p>}
      </div>
      <div className="dashboard-card-body">{children}</div>
    </div>
  );
}

export function FieldEditor({ items, setItems, fields, labelKey }: {
  items: any[]; setItems: (items: any[]) => void;
  fields: { key: string; label: string; type: string }[];
  labelKey?: string;
}) {
  const addItem = () => {
    const obj: any = {};
    fields.forEach(f => obj[f.key] = '');
    setItems([...items, obj]);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...items];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setItems(arr);
  };
  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const arr = [...items];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setItems(arr);
  };
  const updateItem = (i: number, key: string, val: string) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    setItems(arr);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border rounded-3 p-3 mb-3 position-relative">
          <div className="d-flex gap-2 mb-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => moveUp(i)} title="Move Up"><i className="bi bi-chevron-up"></i></button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => moveDown(i)} title="Move Down"><i className="bi bi-chevron-down"></i></button>
            <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => removeItem(i)} title="Remove"><i className="bi bi-trash"></i></button>
          </div>
          {fields.map(f => (
            <div className="mb-2" key={f.key}>
              <label className="form-label text-xs text-muted mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea className="form-control form-control-sm" rows={2} value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              ) : (
                <input type={f.type || 'text'} className="form-control form-control-sm" value={item[f.key] || ''} onChange={e => updateItem(i, f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={addItem}><i className="bi bi-plus-lg me-1"></i>Add Item</button>
    </div>
  );
}
