'use client';
import { useState } from 'react';
import { useAdminLang } from '../../admin-lang-context';

export default function TabsPage() {
  const { t } = useAdminLang();
  const [tab, setTab] = useState('home');
  const [pillTab, setPillTab] = useState('profile');
  return (
    <div className="container-fluid">
      <div className="mb-3"><h1 className="h3 font-bold mb-1">{t('sidebar.components.tabs')}</h1><p className="text-muted text-sm mb-0">{t('ui.components.tabs.subtitle')}</p></div>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Basic Tabs</h5>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item"><button className={`nav-link ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>Home</button></li>
              <li className="nav-item"><button className={`nav-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button></li>
              <li className="nav-item"><button className={`nav-link ${tab === 'contact' ? 'active' : ''}`} onClick={() => setTab('contact')}>Contact</button></li>
              <li className="nav-item"><button className={`nav-link ${tab === 'disabled' ? 'active' : ''}`} disabled>Disabled</button></li>
            </ul>
            {tab === 'home' && <p>Home tab content. This is some placeholder content.</p>}
            {tab === 'profile' && <p>Profile tab content. This is some placeholder content.</p>}
            {tab === 'contact' && <p>Contact tab content. This is some placeholder content.</p>}
          </div></div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-card"><div className="dashboard-card-body">
            <h5 className="fw-semibold mb-3">Pills</h5>
            <ul className="nav nav-pills mb-3">
              <li className="nav-item"><button className={`nav-link ${pillTab === 'home' ? 'active' : ''}`} onClick={() => setPillTab('home')}>Home</button></li>
              <li className="nav-item"><button className={`nav-link ${pillTab === 'profile' ? 'active' : ''}`} onClick={() => setPillTab('profile')}>Profile</button></li>
              <li className="nav-item"><button className={`nav-link ${pillTab === 'messages' ? 'active' : ''}`} onClick={() => setPillTab('messages')}>Messages</button></li>
            </ul>
            {pillTab === 'home' && <p>Home pill content here.</p>}
            {pillTab === 'profile' && <p>Profile pill content here.</p>}
            {pillTab === 'messages' && <p>Messages pill content here.</p>}
          </div></div>
        </div>
      </div>
    </div>
  );
}
