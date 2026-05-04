import { useState } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MapComponent from './components/MapComponent';
import LoginPage from './pages/LoginPage';
import LaporanPage from './pages/LaporanPage';
import RiwayatPage from './pages/RiwayatPage';
import DetailLaporanPage from './pages/DetailLaporanPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css';

function App() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role === 'admin' ? 'admin' : 'sungai';
    }
    return 'sungai';
  });
  const [selectedReport, setSelectedReport] = useState(null); // For detail view

  const isLoggedIn = !!user;

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setActivePage('admin');
    } else {
      setActivePage('sungai');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActivePage('sungai');
  };

  // Protect login-required pages
  const protectedPages = ['laporan', 'riwayat', 'detail', 'admin'];
  if (activePage === 'login' || (protectedPages.includes(activePage) && !isLoggedIn)) {
    return <LoginPage onLogin={handleLoginSuccess} />;
  }

  // Redirect non-admins away from admin page
  if (activePage === 'admin' && user?.role !== 'admin') {
    setActivePage('sungai');
    return null;
  }

  // Render the correct page body
  const renderPage = () => {
    if (activePage === 'laporan') return <LaporanPage />;
    
    if (activePage === 'detail' && selectedReport) {
      return (
        <DetailLaporanPage 
          report={selectedReport} 
          onBack={() => setActivePage('riwayat')} 
          user={user}
        />
      );
    }

    if (activePage === 'riwayat') {
      return (
        <RiwayatPage 
          onViewDetail={(report) => {
            setSelectedReport(report);
            setActivePage('detail');
          }} 
        />
      );
    }

    if (activePage === 'admin') {
      return (
        <AdminDashboard 
          user={user} 
          onLogout={handleLogout} 
          onBack={() => setActivePage('sungai')} 
        />
      );
    }

    // Default: map view for sungai/sawah
    return (
      <div className="main-content">
        <LeftSidebar />
        <div className="map-wrapper">
          <MapComponent 
            activeDataType={activePage}
            selectedFeatureFromSidebar={selectedFeature} 
          />
        </div>
        <RightSidebar 
          activeDataType={activePage} 
          onFeatureClick={(feature) => setSelectedFeature(feature)} 
        />
      </div>
    );
  };

  return (
    <div className="app-container">
      {activePage !== 'admin' && (
        <Header 
          activePage={activePage} 
          onPageChange={(page) => {
            setSelectedReport(null);
            setActivePage(page);
          }} 
          onLoginClick={() => isLoggedIn ? handleLogout() : setActivePage('login')}
          isLoggedIn={isLoggedIn}
          user={user}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;
