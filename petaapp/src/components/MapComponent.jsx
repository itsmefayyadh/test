import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, ZoomControl, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

const { BaseLayer, Overlay } = LayersControl;

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BLOK_COLORS = {
  1: '#22c55e', 2: '#3b82f6', 3: '#eab308', 4: '#ef4444', 5: '#a855f7',
  6: '#f97316', 7: '#06b6d4', 8: '#ec4899', 9: '#6366f1', 10: '#14b8a6',
};

const DEFAULT_COLOR = '#94a3b8';

export default function MapComponent({ activeDataType = 'sawah', zoomToFeature }) {
  const [riverData, setRiverData] = useState(null);
  const [sawahData, setSawahData] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedBlok, setSelectedBlok] = useState(null);
  const [selectedRiver, setSelectedRiver] = useState(null);
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);

  useEffect(() => {
    if (map && zoomToFeature) {
      const layer = L.geoJSON(zoomToFeature);
      const bounds = layer.getBounds();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, animate: true });
    }
  }, [map, zoomToFeature]);

  useEffect(() => {
    fetch('/dataMap/sungefay.geojson').then(res => res.json()).then(data => setRiverData(data));
    fetch('/dataMap/sawah_semua_blok.geojson').then(res => res.json()).then(data => setSawahData(data));
  }, []);

  const riverNames = useMemo(() => {
    if (!riverData) return [];
    const names = new Set();
    riverData.features.forEach(f => {
      if (f.properties.NAMOBJ) names.add(f.properties.NAMOBJ);
    });
    return Array.from(names).sort();
  }, [riverData]);

  const RIVER_COLORS = useMemo(() => {
    const colors = {};
    const palette = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];
    riverNames.forEach((name, i) => {
      colors[name] = palette[i % palette.length];
    });
    return colors;
  }, [riverNames]);

  const sawahStyle = (feature) => {
    const blok = feature.properties.BLOK;
    const isSelected = selectedBlok === null || parseInt(blok) === parseInt(selectedBlok);
    if (!isSelected) return { fillOpacity: 0, opacity: 0, weight: 0 };
    const color = BLOK_COLORS[blok] || DEFAULT_COLOR;
    return { fillColor: color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.6 };
  };

  const riverStyle = (feature) => {
    const name = feature.properties.NAMOBJ;
    const isSelected = selectedRiver === null || name === selectedRiver;
    if (!isSelected) return { opacity: 0, weight: 0 };
    return { color: RIVER_COLORS[name] || '#0ea5e9', weight: 4, opacity: 0.9 };
  };

  const onEachSawah = (feature, layer) => {
    if (feature.properties) {
      const { Name, BLOK, PopupInfo } = feature.properties;
      layer.bindPopup(`
        <div class="map-popup">
          <h3>${Name || 'Tanpa Nama'}</h3>
          <p><strong>Blok:</strong> ${BLOK || '-'}</p>
          <p><strong>Luas:</strong> ${PopupInfo || '-'}</p>
        </div>
      `);
      layer.on({
        mouseover: (e) => {
          if (selectedBlok === null || parseInt(feature.properties.BLOK) === parseInt(selectedBlok)) {
            e.target.setStyle({ fillOpacity: 0.9, weight: 2 });
          }
        },
        mouseout: (e) => {
          if (selectedBlok === null || parseInt(feature.properties.BLOK) === parseInt(selectedBlok)) {
            e.target.setStyle({ fillOpacity: 0.6, weight: 1 });
          }
        }
      });
    }
  };

  const onEachRiver = (feature, layer) => {
    if (feature.properties) {
      const length = feature.properties.SHAPE_Leng ? (feature.properties.SHAPE_Leng * 111).toFixed(2) : '-';
      layer.bindPopup(`
        <div class="map-popup">
          <h3>${feature.properties.NAMOBJ || 'Sungai'}</h3>
          <p><strong>Remark:</strong> ${feature.properties.REMARK || '-'}</p>
          <p><strong>Panjang:</strong> ${length} KM</p>
        </div>
      `);
    }
  };

  const center = [-7.394, 109.935];

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={center} 
        zoom={15} 
        className="leaflet-container"
        zoomControl={false}
        ref={setMap}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Peta Choropleth (Street)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Citra Satelit">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>

          {activeDataType === 'sawah' && sawahData && (
            <Overlay checked name="Layer Sawah">
              <GeoJSON 
                key={`sawah-layer-${selectedBlok}`}
                data={sawahData} 
                style={sawahStyle} 
                onEachFeature={onEachSawah} 
              />
            </Overlay>
          )}

          {activeDataType === 'sungai' && riverData && (
            <Overlay checked name="Layer Sungai">
              <GeoJSON 
                key={`river-layer-${selectedRiver}`}
                data={riverData} 
                style={riverStyle} 
                onEachFeature={onEachRiver}
              />
            </Overlay>
          )}
        </LayersControl>
        
        <ZoomControl position="bottomright" />
      </MapContainer>
      
      {activeDataType === 'sawah' && (
        <div className={`map-legend ${isLegendMinimized ? 'minimized' : ''}`}>
          <div className="legend-header">
            <div className="header-title" onClick={() => setIsLegendMinimized(!isLegendMinimized)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4>Legenda Blok</h4>
              <span className="minimize-icon">{isLegendMinimized ? '□' : '−'}</span>
            </div>
            {!isLegendMinimized && (
              <button 
                className={`show-all-btn ${selectedBlok === null ? 'active' : ''}`}
                onClick={() => setSelectedBlok(null)}
              >
                Semua
              </button>
            )}
          </div>
          {!isLegendMinimized && (
            <div className="legend-items">
              {Object.entries(BLOK_COLORS).map(([blok, color]) => (
                <div 
                  key={blok} 
                  className={`legend-item clickable ${selectedBlok === blok ? 'selected' : ''} ${selectedBlok !== null && selectedBlok !== blok ? 'dimmed' : ''}`}
                  onClick={() => setSelectedBlok(blok)}
                >
                  <span className="color-box" style={{ backgroundColor: color }}></span>
                  <span>Blok {blok}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeDataType === 'sungai' && (
        <div className={`map-legend ${isLegendMinimized ? 'minimized' : ''}`}>
          <div className="legend-header">
            <div className="header-title" onClick={() => setIsLegendMinimized(!isLegendMinimized)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4>Legenda Sungai</h4>
              <span className="minimize-icon">{isLegendMinimized ? '□' : '−'}</span>
            </div>
            {!isLegendMinimized && (
              <button 
                className={`show-all-btn ${selectedRiver === null ? 'active' : ''}`}
                onClick={() => setSelectedRiver(null)}
              >
                Semua
              </button>
            )}
          </div>
          {!isLegendMinimized && (
            <div className="legend-items">
              {riverNames.map((name) => (
                <div 
                  key={name} 
                  className={`legend-item clickable ${selectedRiver === name ? 'selected' : ''} ${selectedRiver !== null && selectedRiver !== name ? 'dimmed' : ''}`}
                  onClick={() => setSelectedRiver(name)}
                >
                  <span className="color-box river" style={{ backgroundColor: RIVER_COLORS[name], height: '4px', borderRadius: '2px' }}></span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

