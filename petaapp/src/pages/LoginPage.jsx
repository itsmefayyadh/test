import React, { useState } from 'react';
import { Map, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

export default function LoginPage({ onLogin, onBack }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        identifier,
        password
      });

      if (response.data.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (onLogin) onLogin(response.data.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      <div className="login-side-image">
        <div className="image-overlay">
          <div className="branding-content">
            <div className="branding-logo">
              <Map size={40} color="#ffffff" />
            </div>
            <h1>Empower Geo</h1>
            <p>Visualisasi Data Geografis & Potensi Desa Adiwarno secara Presisi dan Terintegrasi.</p>
          </div>
        </div>
      </div>

      <div className="login-side-form">
        <div className="form-container">
          <button type="button" className="login-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </button>
          <div className="login-header">
            <h2>Selamat Datang Kembali</h2>
            <p>Silakan masuk ke akun Anda untuk mengelola data geografis.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-group">
              <label>Email / Nama Pengguna</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="admin@adiwarno.id"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ingat saya</span>
              </label>
              <a href="#" className="forgot-password">Lupa sandi?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sedang Masuk...' : 'Masuk Sekarang'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>


          <div className="login-footer">
            Belum punya akun? <a href="#">Hubungi Admin Desa</a>
          </div>
        </div>
      </div>
    </div>
  );
}
