import React from 'react';
import { ArrowLeft, MapPin, Clock, AlertTriangle, FileText, CheckCircle, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import './DetailLaporanPage.css';

const URGENCY_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
const URGENCY_CLASS = { low: 'urgency-low', medium: 'urgency-medium', high: 'urgency-high' };
const STATUS_LABEL = { pending: 'Menunggu Tindak Lanjut', in_progress: 'Sedang Diproses', resolved: 'Selesai Ditangani' };
const STATUS_CLASS = { pending: 'status-pending', in_progress: 'status-progress', resolved: 'status-resolved' };
const TYPE_LABEL = {
  pencemaran_air: 'Pencemaran Air Sungai',
  limbah_pabrik: 'Pembuangan Limbah Pabrik',
  sampah_ilegal: 'Pembuangan Sampah Ilegal',
  kerusakan_lahan: 'Kerusakan Lahan Sawah',
  lainnya: 'Masalah Lingkungan Lainnya'
};

const StatusIcon = {
  pending: <AlertCircle size={18} />,
  in_progress: <AlertTriangle size={18} />,
  resolved: <CheckCircle size={18} />
};

export default function DetailLaporanPage({ report: initialReport, onBack, user }) {
  const [report, setReport] = React.useState(initialReport);
  const [updating, setUpdating] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState(null);

  if (!report) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${import.meta.env.VITE_API_URL}/api/reports/${report.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport({ ...report, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Gagal memperbarui status laporan');
    } finally {
      setUpdating(false);
    }
  };

  // Parse image URLs (stored as comma-separated in image_url column)
  const imageUrls = (report.image_url || report.image_urls || '')
    .split(',')
    .filter(Boolean);

  return (
    <div className="detail-page">
      <div className="detail-container">

        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Kembali
        </button>

        {/* Header */}
        <div className="detail-header">
          <div className="detail-title-row">
            <div className="detail-icon">
              <FileText size={26} color="#ffffff" />
            </div>
            <div>
              <p className="detail-label">Jenis Laporan</p>
              <h1>{TYPE_LABEL[report.type] || report.type}</h1>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="detail-status-card">
          <div className="status-header">
            <div className={`detail-status-badge ${STATUS_CLASS[report.status]}`}>
              {StatusIcon[report.status]}
              {STATUS_LABEL[report.status] || report.status}
            </div>

            {user?.role === 'admin' && (
              <div className="admin-status-controls">
                <span className="admin-label">Ubah Status:</span>
                <select
                  value={report.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="status-select"
                >
                  <option value="pending">Menunggu</option>
                  <option value="in_progress">Diproses</option>
                  <option value="resolved">Selesai</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="detail-card">
          <div className="detail-card-label">Informasi Laporan</div>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <label>Tingkat Urgensi</label>
              <span className={`badge ${URGENCY_CLASS[report.urgency]}`}>
                {URGENCY_LABEL[report.urgency]}
              </span>
            </div>
            <div className="detail-info-item">
              <label>Tanggal Laporan</label>
              <div className="info-with-icon">
                <Clock size={14} />
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
            <div className="detail-info-item full-width">
              <label>Lokasi Kejadian</label>
              <div className="info-with-icon">
                <MapPin size={14} />
                <span>{report.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="detail-card detail-description">
          <div className="detail-card-label">Deskripsi Masalah</div>
          <p>{report.description}</p>
        </div>

        {/* Foto Bukti */}
        <div className="detail-card">
          <div className="detail-card-label">Foto Bukti</div>
          {imageUrls.length > 0 ? (
            <div className="images-grid">
              {imageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="image-item"
                  onClick={() => setPreviewImage(url.trim())}
                >
                  <img src={url.trim()} alt={`Bukti ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-image-placeholder">
              <ImageIcon size={32} />
              <span>Tidak ada foto bukti yang dilampirkan</span>
            </div>
          )}
        </div>

        <div className="detail-footer-note">
          <AlertTriangle size={14} />
          <span>Laporan #{report.id} &mdash; Dilaporkan oleh: {report.username || 'Pengguna'}</span>
        </div>

      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={() => setPreviewImage(null)}><X size={24} /></button>
            <img src={previewImage} alt="Preview Bukti" className="full-preview-img" />
          </div>
        </div>
      )}
    </div>
  );
}
