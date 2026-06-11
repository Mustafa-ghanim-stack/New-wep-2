'use client';
import { useEffect, useState } from 'react';
import { useAdminAPI, StyleBar, TextStyle, EditorCard } from '../components';
import { useAdminLang } from '../admin-lang-context';

interface Dept {
  slug: string; name: string; desc: string; branch: string;
  morning: string; evening: string; morningRate: string; eveningRate: string;
  img: string;
}

interface TFData {
  title: string;              titleStyle?: TextStyle;
  viewAll: string;            viewAllStyle?: TextStyle;
  detailsTitle: string;       detailsTitleStyle?: TextStyle;
  morning: string;            morningLabelStyle?: TextStyle;
  evening: string;            eveningLabelStyle?: TextStyle;
  morningRate: string;        morningRateLabelStyle?: TextStyle;
  eveningRate: string;        eveningRateLabelStyle?: TextStyle;
  department: string;         departmentStyle?: TextStyle;
  branch: string;             branchLabelStyle?: TextStyle;
  cardNameStyle?: TextStyle; cardBranchStyle?: TextStyle;
  cardFeeValueStyle?: TextStyle; cardFeeLabelStyle?: TextStyle;
  cardRateStyle?: TextStyle; cardRateLabelStyle?: TextStyle;
  departments: Dept[];
}

const EMPTY_DEPT: Dept = { slug: '', name: '', desc: '', branch: '', morning: '', evening: '', morningRate: '', eveningRate: '', img: '' };
const EMPTY: TFData = {
  title: '', viewAll: '', detailsTitle: '',
  morning: '', evening: '', morningRate: '', eveningRate: '',
  department: '', branch: '', departments: [],
};

export default function TuitionFeesAdminPage() {
  const { t } = useAdminLang();
  const { fetchContent, saveContent } = useAdminAPI();
  const [ar, setAr] = useState<TFData>(EMPTY);
  const [en, setEn] = useState<TFData>(EMPTY);
  const [tab, setTab] = useState<'text' | 'styles' | 'depts'>('text');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchContent().then(d => {
      if (d.ar?.tuitionFees) setAr({ ...EMPTY, ...d.ar.tuitionFees, departments: d.ar.tuitionFees.departments || [] });
      if (d.en?.tuitionFees) setEn({ ...EMPTY, ...d.en.tuitionFees, departments: d.en.tuitionFees.departments || [] });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const d = await fetchContent();
    d.ar.tuitionFees = { ...(d.ar.tuitionFees || {}), ...ar };
    d.en.tuitionFees = { ...(d.en.tuitionFees || {}), ...en };
    await saveContent(d.ar, d.en);
    setSaving(false);
    setMsg('تم الحفظ'); setTimeout(() => setMsg(''), 2500);
  };

  const sAr = (k: keyof TFData, v: any) => setAr(p => ({ ...p, [k]: v }));
  const sEn = (k: keyof TFData, v: any) => setEn(p => ({ ...p, [k]: v }));

  const updateDept = (lang: 'ar' | 'en', idx: number, k: keyof Dept, v: string) => {
    const setter = lang === 'ar' ? setAr : setEn;
    setter(p => { const depts = [...p.departments]; depts[idx] = { ...depts[idx], [k]: v }; return { ...p, departments: depts }; });
  };
  const addDept = (lang: 'ar' | 'en') => {
    const setter = lang === 'ar' ? setAr : setEn;
    setter(p => ({ ...p, departments: [...p.departments, { ...EMPTY_DEPT }] }));
  };
  const removeDept = (lang: 'ar' | 'en', idx: number) => {
    const setter = lang === 'ar' ? setAr : setEn;
    setter(p => ({ ...p, departments: p.departments.filter((_, i) => i !== idx) }));
  };
  const moveDept = (lang: 'ar' | 'en', idx: number, dir: -1 | 1) => {
    const setter = lang === 'ar' ? setAr : setEn;
    setter(p => {
      const depts = [...p.departments];
      const to = idx + dir;
      if (to < 0 || to >= depts.length) return p;
      [depts[idx], depts[to]] = [depts[to], depts[idx]];
      return { ...p, departments: depts };
    });
  };

  // Renders a label + AR/EN StyleBar + AR/EN input all in one row
  const styledField = (
    label: string,
    valAr: string, onAr: (v: string) => void, styleKeyAr: keyof TFData,
    valEn: string, onEn: (v: string) => void, styleKeyEn: keyof TFData,
  ) => (
    <div className="mb-3 p-3 border rounded-3 bg-light" key={label}>
      <label className="form-label text-xs text-muted fw-semibold mb-2 d-block">{label}</label>
      <div className="row g-3">
        <div className="col-6">
          <small className="text-muted d-block mb-1 fw-semibold">AR</small>
          <StyleBar style={(ar[styleKeyAr] as TextStyle) || {}} onChange={v => sAr(styleKeyAr, v)} />
          <input className="form-control form-control-sm mt-1" dir="rtl" value={valAr} onChange={e => onAr(e.target.value)} />
        </div>
        <div className="col-6">
          <small className="text-muted d-block mb-1 fw-semibold">EN</small>
          <StyleBar style={(en[styleKeyEn] as TextStyle) || {}} onChange={v => sEn(styleKeyEn, v)} />
          <input className="form-control form-control-sm mt-1" value={valEn} onChange={e => onEn(e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderTextTab = () => (
    <div className="row g-3">
      <div className="col-12">
        <EditorCard title="نصوص الصفحة">
          {styledField('عنوان القسم على الرئيسية', ar.title, v => sAr('title', v), 'titleStyle', en.title, v => sEn('title', v), 'titleStyle')}
          {styledField('نص زر "عرض الكل"', ar.viewAll, v => sAr('viewAll', v), 'viewAllStyle', en.viewAll, v => sEn('viewAll', v), 'viewAllStyle')}
          {styledField('عنوان صفحة التفاصيل', ar.detailsTitle, v => sAr('detailsTitle', v), 'detailsTitleStyle', en.detailsTitle, v => sEn('detailsTitle', v), 'detailsTitleStyle')}
        </EditorCard>
      </div>
      <div className="col-12">
        <EditorCard title="تسميات الجدول">
          {styledField('الدراسة الصباحية', ar.morning, v => sAr('morning', v), 'morningLabelStyle', en.morning, v => sEn('morning', v), 'morningLabelStyle')}
          {styledField('الدراسة المسائية', ar.evening, v => sAr('evening', v), 'eveningLabelStyle', en.evening, v => sEn('evening', v), 'eveningLabelStyle')}
          {styledField('نسبة القبول الصباحي', ar.morningRate, v => sAr('morningRate', v), 'morningRateLabelStyle', en.morningRate, v => sEn('morningRate', v), 'morningRateLabelStyle')}
          {styledField('نسبة القبول المسائي', ar.eveningRate, v => sAr('eveningRate', v), 'eveningRateLabelStyle', en.eveningRate, v => sEn('eveningRate', v), 'eveningRateLabelStyle')}
          {styledField('كلمة "القسم"', ar.department, v => sAr('department', v), 'departmentStyle', en.department, v => sEn('department', v), 'departmentStyle')}
          {styledField('كلمة "الفرع"', ar.branch, v => sAr('branch', v), 'branchLabelStyle', en.branch, v => sEn('branch', v), 'branchLabelStyle')}
        </EditorCard>
      </div>
    </div>
  );

  const renderStylesTab = () => {
    const styleBlock = (labelAr: string, icon: string, keyName: keyof TFData) => (
      <div className="mb-3 p-3 border rounded-3 bg-light" key={String(keyName)}>
        <label className="form-label text-xs text-muted fw-semibold d-block mb-1">
          <i className={`bi bi-${icon} me-1 text-primary`}></i>{labelAr}
        </label>
        <div className="row g-2">
          <div className="col-6"><small className="text-muted d-block mb-1">AR</small><StyleBar style={(ar[keyName] as TextStyle) || {}} onChange={v => sAr(keyName, v)} /></div>
          <div className="col-6"><small className="text-muted d-block mb-1">EN</small><StyleBar style={(en[keyName] as TextStyle) || {}} onChange={v => sEn(keyName, v)} /></div>
        </div>
      </div>
    );
    return (
      <EditorCard title="أنماط بطاقات الأقسام (الصفحة الرئيسية)">
        {styleBlock('اسم القسم في البطاقة', 'type-h3', 'cardNameStyle')}
        {styleBlock('شارة الفرع', 'tag', 'cardBranchStyle')}
        {styleBlock('تسمية الرسوم', 'cash', 'cardFeeLabelStyle')}
        {styleBlock('قيمة الرسوم', 'currency-dollar', 'cardFeeValueStyle')}
        {styleBlock('تسمية نسبة القبول', 'percent', 'cardRateLabelStyle')}
        {styleBlock('قيمة نسبة القبول', '123', 'cardRateStyle')}
      </EditorCard>
    );
  };

  const renderDeptEditor = (lang: 'ar' | 'en', depts: Dept[]) => (
    <div>
      {depts.map((dept, i) => (
        <div key={i} className="border rounded-3 p-3 mb-3 bg-white">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-primary">{i + 1}. {dept.slug || '(جديد)'}</span>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => moveDept(lang, i, -1)}><i className="bi bi-arrow-up"></i></button>
              <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => moveDept(lang, i, 1)}><i className="bi bi-arrow-down"></i></button>
              <button className="btn btn-sm btn-outline-danger px-2" onClick={() => removeDept(lang, i)}><i className="bi bi-trash"></i></button>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">Slug (رابط)</label>
              <input className="form-control form-control-sm" value={dept.slug} onChange={e => updateDept(lang, i, 'slug', e.target.value)} placeholder="e.g. cybersecurity" />
            </div>
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">الفرع</label>
              <input className="form-control form-control-sm" value={dept.branch} onChange={e => updateDept(lang, i, 'branch', e.target.value)} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
            </div>
            <div className="col-12">
              <label className="form-label text-xs text-muted mb-0">اسم القسم</label>
              <input className="form-control form-control-sm" value={dept.name} onChange={e => updateDept(lang, i, 'name', e.target.value)} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
            </div>
            <div className="col-12">
              <label className="form-label text-xs text-muted mb-0">الوصف</label>
              <textarea className="form-control form-control-sm" rows={2} value={dept.desc} onChange={e => updateDept(lang, i, 'desc', e.target.value)} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
            </div>
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">الرسوم الصباحية</label>
              <input className="form-control form-control-sm" value={dept.morning} onChange={e => updateDept(lang, i, 'morning', e.target.value)} placeholder="3,000,000" />
            </div>
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">الرسوم المسائية</label>
              <input className="form-control form-control-sm" value={dept.evening} onChange={e => updateDept(lang, i, 'evening', e.target.value)} placeholder="2,250,000" />
            </div>
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">نسبة القبول الصباحي</label>
              <input className="form-control form-control-sm" value={dept.morningRate} onChange={e => updateDept(lang, i, 'morningRate', e.target.value)} placeholder="59.50%" />
            </div>
            <div className="col-6">
              <label className="form-label text-xs text-muted mb-0">نسبة القبول المسائي</label>
              <input className="form-control form-control-sm" value={dept.eveningRate} onChange={e => updateDept(lang, i, 'eveningRate', e.target.value)} placeholder="61.50%" />
            </div>
            <div className="col-12">
              <label className="form-label text-xs text-muted mb-0">مسار الصورة (img)</label>
              <input className="form-control form-control-sm" value={dept.img} onChange={e => updateDept(lang, i, 'img', e.target.value)} placeholder="/images/departments/cs.jpg" />
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-primary btn-sm" onClick={() => addDept(lang)}>
        <i className="bi bi-plus-lg me-1"></i>إضافة قسم
      </button>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 font-bold mb-1">الرسوم الدراسية</h1>
          <p className="text-muted text-sm mb-0">تعديل محتوى وأنماط صفحة الرسوم الدراسية</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-1"></span>جارٍ الحفظ...</> : <><i className="bi bi-check-lg me-1"></i>حفظ الكل</>}
        </button>
      </div>
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'text' ? 'active' : ''}`} onClick={() => setTab('text')}><i className="bi bi-translate me-1"></i>النصوص</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'styles' ? 'active' : ''}`} onClick={() => setTab('styles')}><i className="bi bi-palette me-1"></i>أنماط البطاقات</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'depts' ? 'active' : ''}`} onClick={() => setTab('depts')}><i className="bi bi-building me-1"></i>الأقسام</button></li>
      </ul>

      {tab === 'text' && renderTextTab()}
      {tab === 'styles' && renderStylesTab()}
      {tab === 'depts' && (
        <div className="dashboard-grid grid-cols-2">
          <EditorCard title={`الأقسام — عربي (${ar.departments.length})`}>{renderDeptEditor('ar', ar.departments)}</EditorCard>
          <EditorCard title={`الأقسام — English (${en.departments.length})`}>{renderDeptEditor('en', en.departments)}</EditorCard>
        </div>
      )}
    </div>
  );
}
