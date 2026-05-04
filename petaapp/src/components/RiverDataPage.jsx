import { useState, useEffect } from 'react';
import './RiverDataPage.css';

export default function RiverDataPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/dataMap/sungefay.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        // Extract properties from features
        const features = geojson.features.map((f, index) => ({
          id: index + 1,
          ...f.properties
        }));
        setData(features);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch river data', err);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter((item) => {
    const nameMatch = item.NAMOBJ?.toLowerCase().includes(searchTerm.toLowerCase());
    const remarkMatch = item.REMARK?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || remarkMatch;
  });

  return (
    <div className="river-data-container">
      <div className="river-data-header">
        <div className="header-text">
          <h2>Data Sungai (Sungefay)</h2>
          <p>Informasi detail mengenai atribut sungai di wilayah ini.</p>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari nama sungai atau remark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Memuat data...</div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">Tidak ada data yang ditemukan.</div>
        ) : (
          <table className="river-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Sungai (NAMOBJ)</th>
                <th>Keterangan (REMARK)</th>
                <th>Panjang (SHAPE_Leng)</th>
                <th>Kode (LCODE)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={item.id} style={{ animationDelay: `${idx * 0.05}s` }} className="table-row">
                  <td>{item.id}</td>
                  <td>
                    <span className="river-name">{item.NAMOBJ || 'Tidak diketahui'}</span>
                  </td>
                  <td>
                    <span className="badge">{item.REMARK || '-'}</span>
                  </td>
                  <td>
                    {item.SHAPE_Leng ? item.SHAPE_Leng.toFixed(5) : '-'}
                  </td>
                  <td className="code-cell">{item.LCODE || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
