'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function DualListPage() {
  const { t } = useAdminLang();
  const [left, setLeft] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
  const [right, setRight] = useState(['Selected A', 'Selected B']);
  const [selectedLeft, setSelectedLeft] = useState<number[]>([]);
  const [selectedRight, setSelectedRight] = useState<number[]>([]);

  const moveRight = () => {
    const toMove = selectedLeft.sort((a,b)=>b-a).map(i => left[i]);
    setRight([...right, ...toMove]);
    setLeft(left.filter((_, i) => !selectedLeft.includes(i)));
    setSelectedLeft([]);
  };
  const moveAllRight = () => { setRight([...right, ...left]); setLeft([]); setSelectedLeft([]); };
  const moveLeft = () => {
    const toMove = selectedRight.sort((a,b)=>b-a).map(i => right[i]);
    setLeft([...left, ...toMove]);
    setRight(right.filter((_, i) => !selectedRight.includes(i)));
    setSelectedRight([]);
  };
  const moveAllLeft = () => { setLeft([...left, ...right]); setRight([]); setSelectedRight([]); };

  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.duallist')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.duallist.subtitle')}</p></div>
      <div className="dashboard-card"><div className="dashboard-card-body">
        <div className="row align-items-center">
          <div className="col-5">
            <h6 className="fw-semibold mb-2">Available</h6>
            <div className="border rounded" style={{minHeight:200,maxHeight:300,overflow:'auto'}}>
              {left.map((item, i) => (
                <div key={i} className={`p-2 border-bottom ${selectedLeft.includes(i) ? 'bg-primary text-white' : ''}`} style={{cursor:'pointer'}} onClick={() => {
                  setSelectedLeft(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
                }}>{item}</div>
              ))}
            </div>
          </div>
          <div className="col-2 d-flex flex-column align-items-center gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={moveRight} disabled={selectedLeft.length === 0}><i className="bi bi-chevron-right"></i></button>
            <button className="btn btn-outline-primary btn-sm" onClick={moveAllRight} disabled={left.length === 0}><i className="bi bi-chevron-double-right"></i></button>
            <button className="btn btn-outline-primary btn-sm" onClick={moveLeft} disabled={selectedRight.length === 0}><i className="bi bi-chevron-left"></i></button>
            <button className="btn btn-outline-primary btn-sm" onClick={moveAllLeft} disabled={right.length === 0}><i className="bi bi-chevron-double-left"></i></button>
          </div>
          <div className="col-5">
            <h6 className="fw-semibold mb-2">Selected</h6>
            <div className="border rounded" style={{minHeight:200,maxHeight:300,overflow:'auto'}}>
              {right.map((item, i) => (
                <div key={i} className={`p-2 border-bottom ${selectedRight.includes(i) ? 'bg-primary text-white' : ''}`} style={{cursor:'pointer'}} onClick={() => {
                  setSelectedRight(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
                }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div></div>
    </div>
  );
}
