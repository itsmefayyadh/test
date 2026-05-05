import { useState, useEffect } from 'react';
import { Search, MapPin, Droplets, Grid } from 'lucide-react';
import './RightSidebar.css';

export default function RightSidebar({ activeDataType, onFeatureClick }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    const file = activeDataType === 'sungai' ? '/dataMap/sungefay.geojson' : '/dataMap/sawah.geojson';
    
    fetch(file)
      .then((res) => res.json())
      .then((geojson) => {
        const features = geojson.features
          .filter(f => {
            if (activeDataType === 'sungai') {
              return f.properties.NAMOBJ && f.properties.NAMOBJ.trim() !== "" && !f.properties.NAMOBJ.toLowerCase().includes("unnamed");
            }
            return true;
          })
          .map((f, index) => {
            return {
              id: index + 1,
              lcode: f.properties.LCODE || `ID-${1000 + index}`,
              name: f.properties.NAMOBJ || (activeDataType === 'sungai' ? `Sungai ${index + 1}` : `Area Sawah ${index + 1}`),
              remark: f.properties.REMARK || '-',
              length: f.properties.SHAPE_Leng ? (f.properties.SHAPE_Leng * 111).toFixed(2) : '-',
              area: f.properties.SHAPE_Area ? (f.properties.SHAPE_Area * 10000).toFixed(2) : '-',
              rawFeature: f
            };
          });
        setData(features);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${activeDataType} data`, err);
        setLoading(false);
      });
  }, [activeDataType]);

  const filteredData = data.filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.lcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.remark.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <aside className="right-sidebar">
      <div className="rs-header">
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', textAlign: 'left' }}>
          {activeDataType === 'sungai' ? 'Direktori Sungai' : 'Desa Adiwarno, Wonosobo, Jateng'}
        </h2>

        {activeDataType === 'sawah' && (
          <div className="village-content">
            <p className="village-desc" style={{ textAlign: 'justify', color: '#475569', fontSize: '13px', lineHeight: '1.6' }}>
              Sawah merupakan urat nadi perekonomian di Desa Adiwarno, Kecamatan Selomerto, Kab Wonosobo, Jateng, di mana potensi persawahan menjadi sektor yang paling menonjol berkat kondisi alam yang sangat subur. Sebagai sektor ekonomi utama, sebagian besar penduduk desa menggantungkan hidupnya sebagai petani padi, buruh tani, maupun pengusaha penggilingan padi. Karakteristik lahan yang strategis di wilayah Selomerto memungkinkan penanaman komoditas tanaman semusim dilakukan secara teratur karena tidak hanya mengandalkan air hujan semata.
              <br/><br/>
              Keberlangsungan pertanian di Desa Adiwarno didukung oleh sistem irigasi teknis dan setengah teknis, serta diperkuat dengan program strategis pompanisasi untuk meningkatkan indeks pertanaman pada lahan-lahan yang membutuhkan tambahan suplai air. Meskipun fokus utamanya adalah padi sawah dengan varietas unggul seperti Inpari 32 yang tahan penyakit dan berproduktivitas tinggi, lahan di desa ini juga sangat potensial untuk tanaman pangan lain seperti jagung, kacang tanah, kedelai, hingga ubi kayu. Selain itu, keberadaan persawahan ini menciptakan integrasi ekonomi yang baik dengan mendukung sektor peternakan dan perikanan melalui pemanfaatan berbagai produk sampingan hasil pertanian.
            </p>
            
            <div className="village-stats-simple" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <div className="v-stat">
                <span className="v-label" style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Luas Lahan</span>
                <span className="v-value" style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '4px', display: 'block' }}>
                  {(data.reduce((acc, curr) => acc + parseFloat(curr.area || 0), 0)).toFixed(2)} Ha
                </span>
              </div>
            </div>
          </div>
        )}

        {activeDataType === 'sungai' && (
          <div className="rs-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari sungai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {activeDataType === 'sungai' && (
        <div className="rs-list">
          {loading ? (
            <div className="rs-loading">Memuat data...</div>
          ) : filteredData.length === 0 ? (
            <div className="rs-empty">Tidak ada data ditemukan.</div>
          ) : (
            filteredData.map((item) => (
              <div className="river-card" key={item.id} onClick={() => onFeatureClick && onFeatureClick(item.rawFeature)}>
                <div className="card-header">
                  <div className="river-info">
                    <h3>{item.name}</h3>
                    <div className="river-meta">
                      <MapPin size={12} />
                      <span>ID: {item.lcode}</span>
                      <span className="separator">•</span>
                      <span>{item.length} KM</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
