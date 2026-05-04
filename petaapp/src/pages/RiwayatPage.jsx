import React, { useState, useEffect } from 'react';
import { FileText, Clock, MapPin, ChevronRight, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import './RiwayatPage.css';

const URGENCY_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
const URGENCY_CLASS = { low: 'urgency-low', medium: 'urgency-medium', high: 'urgency-high' };
const STATUS_LABEL = { pending: 'Menunggu', in_progress: 'Diproses', resolved: 'Selesai' };
const STATUS_CLASS = { pending: 'status-pending', in_progress: 'status-progress', resolved: 'status-resolved' };
const TYPE_LABEL = {
  pencemaran_air: 'Pencemaran Air Sungai',
  limbah_pabrik: 'Pembuangan Limbah Pabrik',
  sampah_ilegal: 'Pembuangan Sampah Ilegal',
  kerusakan_lahan: 'Kerusakan Lahan Sawah',
  lainnya: 'Masalah Lingkungan Lainnya'
};

export default function RiwayatPage({ onViewDetail }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data);
      } catch (err) {
        setError('Gagal memuat data laporan. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="riwayat-page">
      <div className="riwayat-container">
        <div className="riwayat-header">
          <div>
            <h1>Riwayat Laporan</h1>
            <p>Daftar semua laporan lingkungan yang telah Anda kirimkan.</p>
          </div>
          <div className="riwayat-count">{reports.length} Laporan</div>
        </div>

        {loading && (
          <div className="loading-state">
            <Loader size={32} className="spin" />
            <p>Memuat data laporan...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <AlertTriangle size={32} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="empty-state">
            <FileText size={64} color="#cbd5e1" />
            <h3>Belum Ada Laporan</h3>
            <p>Anda belum pernah mengirimkan laporan lingkungan.</p>
          </div>
        )}

        <div className="report-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-card-left">
                <div className="report-type-icon">
                  <FileText size={20} color="#64748b" />
                </div>
                <div className="report-info">
                  <div className="report-type-label">{TYPE_LABEL[report.type] || report.type}</div>
                  <div className="report-location">
                    <MapPin size={13} />
                    {report.location}
                  </div>
                  <div className="report-date">
                    <Clock size={13} />
                    {formatDate(report.created_at)}
                  </div>
                </div>
              </div>
              <div className="report-card-right">
                <div className="report-badges">
                  <span className={`badge ${URGENCY_CLASS[report.urgency]}`}>
                    {URGENCY_LABEL[report.urgency]}
                  </span>
                  <span className={`badge ${STATUS_CLASS[report.status]}`}>
                    {STATUS_LABEL[report.status] || report.status}
                  </span>
                </div>
                <button className="detail-btn" onClick={() => onViewDetail(report)}>
                  Lihat Detail <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
