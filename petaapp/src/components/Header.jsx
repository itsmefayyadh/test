import { Bell, Settings, HelpCircle } from 'lucide-react';
import './Header.css';

export default function Header({ activePage, onPageChange, onLoginClick, isLoggedIn, user }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <h1>Empower Geo</h1>
        <nav className="header-nav">
          <button
            className={`h-nav-item ${activePage === 'sungai' ? 'active' : ''}`}
            onClick={() => onPageChange('sungai')}
          >
            Direktori Sungai
          </button>
          <button
            className={`h-nav-item ${activePage === 'sawah' ? 'active' : ''}`}
            onClick={() => onPageChange('sawah')}
          >
            Direktori Sawah
          </button>
          <button 
            className={`h-nav-item ${activePage === 'laporan' ? 'active' : ''}`}
            onClick={() => onPageChange('laporan')}
          >
            Laporan Lingkungan
          </button>
          {isLoggedIn && (
            <>
              <button 
                className={`h-nav-item ${activePage === 'riwayat' || activePage === 'detail' ? 'active' : ''}`}
                onClick={() => onPageChange('riwayat')}
              >
                {user?.role === 'admin' ? 'Riwayat & Detail' : 'Riwayat Laporan'}
              </button>
              {user?.role === 'admin' && (
                <button 
                  className={`h-nav-item ${activePage === 'admin' ? 'active' : ''}`}
                  onClick={() => onPageChange('admin')}
                >
                  Panel Admin
                </button>
              )}
            </>
          )}
        </nav>
      </div>
      <div className="header-right">
        <button className="login-btn" onClick={onLoginClick}>
          {isLoggedIn ? 'Keluar' : 'Masuk'}
        </button>
      </div>
    </header>
  );
}
