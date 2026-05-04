import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Users, Activity, CheckCircle, Clock, AlertTriangle, Shield, AlertCircle } from 'lucide-react';

const TYPE_LABEL = {
  pencemaran_air: 'Pencemaran Air',
  limbah_pabrik: 'Limbah Pabrik',
  penebangan_liar: 'Penebangan Liar',
  sampah_sungai: 'Sampah Sungai',
  lainnya: 'Lainnya'
};

const STATUS_LABEL = { pending: 'Menunggu', in_progress: 'Diproses', resolved: 'Selesai' };
const STATUS_CLASS = { pending: 'status-pending', in_progress: 'status-progress', resolved: 'status-resolved' };
const URGENCY_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };

export default function AdminHome() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [reportsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reports', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const reports = reportsRes.data;
      setStats({
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        resolvedReports: reports.filter(r => r.status === 'resolved').length,
        totalUsers: usersRes.data.length
      });
      setRecentReports(reports.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Beranda Admin</h1>
        <p>Ringkasan performa dan aktivitas sistem hari ini.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg reports"><FileText size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Laporan</span>
            <span className="stat-value">{stats.totalReports}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg users"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Pengguna</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg pending"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Laporan Menunggu</span>
            <span className="stat-value">{stats.pendingReports}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg resolved"><CheckCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Laporan Selesai</span>
            <span className="stat-value">{stats.resolvedReports}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="admin-table-container">
          <div style={{ padding: '20px', borderBottom: '1px solid #eee', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Laporan Terbaru
          </div>
          <table className="admin-table mini">
            <thead>
              <tr>
                <th>User</th>
                <th>Jenis</th>
                <th>Urgensi</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '600' }}>{r.username}</td>
                  <td style={{ fontSize: '12px' }}>{TYPE_LABEL[r.type] || r.type}</td>
                  <td>
                    <span className={`urgency-badge ${r.urgency}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {URGENCY_LABEL[r.urgency] || r.urgency}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[r.status]}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="admin-table-container">
          <div style={{ padding: '20px', borderBottom: '1px solid #eee', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> Perhatian
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ background: stats.pendingReports > 0 ? '#fff1f2' : '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid', borderColor: stats.pendingReports > 0 ? '#fecaca' : '#bbf7d0' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: stats.pendingReports > 0 ? '#991b1b' : '#166534' }}>
                {stats.pendingReports > 0 
                  ? `Ada ${stats.pendingReports} laporan menunggu.`
                  : 'Semua aman!'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: stats.pendingReports > 0 ? '#b91c1c' : '#15803d' }}>
                {stats.pendingReports > 0 
                  ? 'Segera cek tab Kelola Laporan.'
                  : 'Tidak ada tugas tertunda.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
