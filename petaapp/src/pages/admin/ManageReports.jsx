import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MoreVertical, Eye, Trash2, FileText } from 'lucide-react';

const STATUS_LABEL = { pending: 'Menunggu', in_progress: 'Diproses', resolved: 'Selesai' };
const STATUS_CLASS = { pending: 'status-pending', in_progress: 'status-progress', resolved: 'status-resolved' };

const TYPE_LABEL = {
  pencemaran_air: 'Pencemaran Air',
  limbah_pabrik: 'Limbah Pabrik',
  sampah_ilegal: 'Sampah Ilegal',
  kerusakan_lahan: 'Kerusakan Lahan',
  lainnya: 'Lainnya'
};

export default function ManageReports({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Hapus laporan ini secara permanen?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      alert('Gagal menghapus laporan');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manajemen Laporan</h1>
        <p>Lihat dan kelola semua laporan lingkungan dari warga.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg reports"><FileText size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Laporan</span>
            <span className="stat-value">{reports.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg pending"><Search size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Menunggu</span>
            <span className="stat-value">{reports.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg resolved"><MoreVertical size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Selesai</span>
            <span className="stat-value">{reports.filter(r => r.status === 'resolved').length}</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pelapor</th>
              <th>Jenis Laporan</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-mini">{report.username.charAt(0).toUpperCase()}</div>
                    <span>{report.username}</span>
                  </div>
                </td>
                <td>{TYPE_LABEL[report.type] || report.type}</td>
                <td>{report.location}</td>
                <td>
                  <span className={`status-pill ${STATUS_CLASS[report.status]}`}>
                    {STATUS_LABEL[report.status]}
                  </span>
                </td>
                <td>{new Date(report.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => onSelectReport(report)}>
                      <Eye size={14} /> Detail
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
