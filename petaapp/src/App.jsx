import { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MapComponent from './components/MapComponent';
import RiverDataPage from './components/RiverDataPage';
import LaporanPage from './pages/LaporanPage';
import RiwayatPage from './pages/RiwayatPage';
import LoginPage from './pages/LoginPage';
import AdminHome from './pages/admin/AdminHome';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('sawah');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setShowLogin(false);
  };

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setActivePage('sawah');
  };

  const renderContent = () => {
    if (showLogin) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />;
    }

    switch (activePage) {
      case 'sungai':
        return (
          <div className="dashboard-layout">
            <LeftSidebar />
            <main className="main-content">
              <MapComponent activeDataType="sungai" zoomToFeature={selectedFeature} />
            </main>
            <RightSidebar activeDataType="sungai" onFeatureClick={handleFeatureClick} />
          </div>
        );
      case 'sawah':
        return (
          <div className="dashboard-layout">
            <LeftSidebar />
            <main className="main-content">
              <MapComponent activeDataType="sawah" zoomToFeature={selectedFeature} />
            </main>
            <RightSidebar activeDataType="sawah" onFeatureClick={handleFeatureClick} />
          </div>
        );
      case 'laporan':
        return <LaporanPage />;
      case 'riwayat':
        return <RiwayatPage user={user} />;
      case 'admin':
        return <AdminHome />;
      default:
        return <MapComponent activeDataType="sawah" />;
    }
  };

  return (
    <div className="app-container">
      <Header 
        activePage={activePage} 
        onPageChange={setActivePage} 
        onLoginClick={isLoggedIn ? handleLogout : () => setShowLogin(true)}
        isLoggedIn={isLoggedIn}
        user={user}
      />
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
