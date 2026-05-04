import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import InfoPanel from './InfoPanel';

export default function MapComponent({ activeDataType, selectedFeatureFromSidebar }) {
  const mapCenter = [-7.408, 109.925];
  const [sawahData, setSawahData] = useState(null);
  const [sungefayData, setSungefayData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  const [map, setMap] = useState(null);

  // Sync internal visibility with activeDataType prop
  const showSungefay = activeDataType === 'sungai';
  const showSawah = activeDataType === 'sawah';

  useEffect(() => {
    // Fix Leaflet icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    
    Promise.all([
      fetch('/dataMap/sawah.geojson').then(res => res.json()),
      fetch('/dataMap/sungefay.geojson').then(res => res.json())
    ])
      .then(([sawah, sungefay]) => {
        setSawahData(sawah);
        setSungefayData(sungefay);
      })
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // When a feature is selected from the sidebar
  useEffect(() => {
    if (map && selectedFeatureFromSidebar) {
      try {
        const layer = L.geoJSON(selectedFeatureFromSidebar);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          
          setSelectedFeature(selectedFeatureFromSidebar);
          setSelectedType(activeDataType); 
        }
      } catch (e) {
        console.warn('Could not fit bounds to selected feature');
      }
    }
  }, [map, selectedFeatureFromSidebar]);

  const onEachFeature = (feature, layer, dataType) => {
    layer.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      setSelectedFeature(feature);
      setSelectedType(dataType === 'sungefay' ? 'sungefay' : 'sawah');
    });

    if (feature.properties.NAMOBJ) {
      layer.bindTooltip(feature.properties.NAMOBJ, { sticky: true });
    }
  };

  const styleSawah = () => ({
    fillColor: '#22c55e',
    weight: 2,
    opacity: 0.8,
    color: '#16a34a',
    fillOpacity: 0.4
  });

  const styleSungefay = () => ({
    fillColor: '#38bdf8',
    weight: 4,
    opacity: 1,
    color: '#0ea5e9',
    fillOpacity: 0.8
  });

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={setMap}
      >
        {/* Base Layer: Satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri'
        />
        
        {/* GeoJSON Layers filtered by activeDataType */}
        {sawahData && showSawah && (
          <GeoJSON 
            data={sawahData}
            onEachFeature={(f, l) => onEachFeature(f, l, 'sawah')}
            style={styleSawah}
          />
        )}
        {sungefayData && showSungefay && (
          <GeoJSON 
            data={sungefayData}
            onEachFeature={(f, l) => onEachFeature(f, l, 'sungefay')}
            style={styleSungefay}
          />
        )}

        {/* Reference Layer: Labels (Desa, Sekolah, etc.) on top pane */}
        <Pane name="labels" style={{ zIndex: 650 }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution='Labels &copy; Esri'
            opacity={1}
          />
        </Pane>
      </MapContainer>

      {/* Info Panel Overlay */}
      {selectedFeature && (
        <InfoPanel 
          feature={selectedFeature}
          dataType={selectedType}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
}




