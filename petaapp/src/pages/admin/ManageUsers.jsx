import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Shield, Trash2, Mail, Plus, Edit2, X } from 'lucide-react';
import './UserModal.css';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, password: '', role: user.role || 'user' });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingUser) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editingUser.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers([res.data, ...users]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini? Semua laporan terkait juga akan terhapus.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus user');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Manajemen User</h1>
          <p>Daftar semua pengguna yang terdaftar di sistem.</p>
        </div>
        <button className="action-btn" style={{ background: '#000', color: '#fff' }} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Tambah User
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg reports"><User size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total User</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg pending"><Shield size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Admin</span>
            <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg resolved"><Mail size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Warga</span>
            <span className="stat-value">{users.filter(u => u.role === 'user').length}</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Bergabung Pada</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-mini">{u.username.charAt(0).toUpperCase()}</div>
                    <span>{u.username}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {u.role === 'admin' ? <Shield size={14} color="#3b82f6" /> : <User size={14} color="#64748b" />}
                    <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                  </div>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => handleOpenModal(u)}>
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.role === 'admin' && u.username === 'admin'}
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

      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser && '(Kosongkan jika tidak ingin diubah)'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser} 
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">User / Warga</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="action-btn" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="action-btn" style={{ background: '#000', color: '#fff' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
