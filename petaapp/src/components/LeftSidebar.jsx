import { useState, useEffect } from 'react';
import { Database, Map as MapIcon, Droplets, Grid } from 'lucide-react';
import './LeftSidebar.css';

export default function LeftSidebar() {
  const [stats, setStats] = useState({
    totalRivers: 0,
    totalSawah: 0,
    riverLength: 0,
    sawahArea: 0
  });

  useEffect(() => {
    Promise.all([
      fetch('/dataMap/sungefay.geojson').then(res => res.json()),
      fetch('/dataMap/sawah.geojson').then(res => res.json())
    ]).then(([rivers, sawah]) => {
      const riverCount = rivers.features.length;
      const sawahCount = sawah.features.length;
      
      // Rough calculation of length and area if available
      let totalLength = 0;
      rivers.features.forEach(f => {
        if (f.properties.SHAPE_Leng) totalLength += f.properties.SHAPE_Leng;
      });

      let totalArea = 0;
      sawah.features.forEach(f => {
        if (f.properties.SHAPE_Area) totalArea += f.properties.SHAPE_Area;
      });

      setStats({
        totalRivers: riverCount,
        totalSawah: sawahCount,
        riverLength: (totalLength * 111).toFixed(2), // Rough km conversion
        sawahArea: (totalArea * 10000).toFixed(2) // Rough hectares/sqm conversion
      });
    });
  }, []);

  return (
    <aside className="left-sidebar">
      <div className="sidebar-brand">
        <Database size={20} color="#ffffff" />
        <div className="brand-text">
          <h2>Ringkasan Data</h2>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon rivers">
            <Droplets size={20} />
          </div>
          <div className="stat-info">
            <span className="label">Total Segmen Sungai</span>
            <strong className="value">{stats.totalRivers}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon length">
            <MapIcon size={20} />
          </div>
          <div className="stat-info">
            <span className="label">Estimasi Panjang Sungai</span>
            <strong className="value">{stats.riverLength} KM</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sawah">
            <Grid size={20} />
          </div>
          <div className="stat-info">
            <span className="label">Total Luas Sawah</span>
            <strong className="value">{stats.sawahArea} Ha</strong>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>Update Terakhir: {new Date().toLocaleDateString()}</p>
      </div>
    </aside>
  );
}
