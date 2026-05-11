import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, ArrowLeft } from 'lucide-react';
import ManageReports from './ManageReports';
import ManageUsers from './ManageUsers';
import AdminHome from './AdminHome';
import DetailLaporanPage from '../DetailLaporanPage';
import './AdminDashboard.css';

export default function AdminDashboard({ user, onLogout, onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState(null);

  const renderContent = () => {
    if (selectedReport) {
      return (
        <DetailLaporanPage
          report={selectedReport}
          onBack={() => setSelectedReport(null)}
          user={user}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminHome />;
      case 'reports':
        return <ManageReports onSelectReport={(report) => setSelectedReport(report)} />;
      case 'users':
        return <ManageUsers />;
      default:
        return <ManageReports />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="brand-title">Empower Geo</h1>
          <h2 className="admin-title">Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            Beranda
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={18} />
            Kelola Laporan
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Kelola User
          </button>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button className="admin-nav-item" onClick={() => onBack()}>
              <ArrowLeft size={18} />
              Kembali ke Beranda
            </button>
            <button className="admin-nav-item" style={{ color: '#f87171' }} onClick={() => onLogout()}>
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {renderContent()}
      </main>
    </div>
  );
}
