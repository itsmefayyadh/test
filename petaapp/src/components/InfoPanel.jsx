import './InfoPanel.css'

const ATTRIBUTE_LABELS = {
  // Sawah attributes
  NAMOBJ: 'Nama Objek',
  JNSSWH: 'Jenis Sawah',
  FCODE: 'Feature Code',
  AQDATE: 'Tanggal Akuisisi Data',
  PUDATE: 'Tanggal Publikasi',
  REMARK: 'Keterangan',
  KODLCO: 'Kode Lokasi',
  LCODE: 'Kode Feature',
  TNMSWH: 'Tingkat Nama Sawah',
  SHAPE_Leng: 'Panjang Perimeter (°)',
  SHAPE_Area: 'Luas Area (°²)',
  
  // Sungai attributes
  TIPSNG: 'Tipe Sungai',
  KLSSNG: 'Klasifikasi Sungai',
  WMAX: 'Lebar Maksimal (m)',
  DBTMAX: 'Kedalaman Maksimal (m)',
  SLPRT: 'Slope/Kemiringan',
}

const JENIS_SAWAH = {
  999: 'Sawah',
  1: 'Sawah Irigasi',
  2: 'Sawah Tadah Hujan',
  3: 'Sawah Lebak'
}

export default function InfoPanel({ feature, dataType, onClose }) {
  if (!feature) return null

  const props = feature.properties
  const title = props.NAMOBJ || (dataType === 'sawah' ? 'Sawah' : 'Sungai')
  
  // Get all non-null and non-zero properties
  const attributes = Object.entries(props)
    .filter(([key, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'number' && value === 0) return false;
      if (typeof value === 'string' && (value.trim() === "" || value === "0" || value === "0.0000" || value === "0.0")) return false;
      return true;
    })
    .map(([key, value]) => ({
      key,
      label: ATTRIBUTE_LABELS[key] || key,
      value: formatValue(key, value)
    }))

  function formatValue(key, value) {
    // Format jenis sawah
    if (key === 'JNSSWH' && JENIS_SAWAH[value]) {
      return `${value} (${JENIS_SAWAH[value]})`
    }
    
    // Format numbers with 4 decimal places
    if (typeof value === 'number') {
      return value.toFixed(4)
    }
    
    return value
  }

  return (
    <div className="info-panel">
      <div className="info-header">
        <div className="info-title-section">
          <div>
            <h2 className="info-title">{title}</h2>
            <p className="info-type">{dataType === 'sawah' ? 'Persawahan' : 'Sungai/Waterway'}</p>
          </div>
        </div>
        <button className="info-close" onClick={onClose}>✕</button>
      </div>

      <div className="info-content">
        <div className="info-grid">
          {attributes.length > 0 ? (
            attributes.map(({ key, label, value }) => (
              <div key={key} className="info-row">
                <dt className="info-label">{label}</dt>
                <dd className="info-value">{value}</dd>
              </div>
            ))
          ) : (
            <p className="info-empty">Tidak ada detail informasi tambahan.</p>
          )}
        </div>
      </div>
    </div>
  )
}
