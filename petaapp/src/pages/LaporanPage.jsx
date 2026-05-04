import React, { useState } from 'react';
import { Send, MapPin, AlertTriangle, Image as ImageIcon, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import './LaporanPage.css';

export default function LaporanPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    urgency: 'medium',
    images: []
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...formData.images, ...files];
      const newPreviews = files.map(file => URL.createObjectURL(file));

      setFormData({ ...formData, images: newImages });
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    setFormData({ ...formData, images: newImages });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      // Build FormData to support file uploads
      const data = new FormData();
      data.append('type', formData.type);
      data.append('urgency', formData.urgency);
      data.append('location', formData.location);
      data.append('description', formData.description);
      formData.images.forEach(img => data.append('images', img));

      await axios.post(`${import.meta.env.VITE_API_URL}/api/reports`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ type: '', location: '', description: '', urgency: 'medium', images: [] });
        setPreviews([]);
      }, 3000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError(err.response?.data?.error || 'Gagal mengirim laporan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="laporan-page">
      <div className="laporan-container">
        <div className="laporan-header">
          <h1>Laporan Lingkungan</h1>
          <p>Laporkan masalah pencemaran atau kerusakan lingkungan di sekitar Desa Adiwarno.</p>
        </div>

        {submitted ? (
          <div className="success-message">
            <CheckCircle size={64} color="#16a34a" />
            <h2>Laporan Berhasil Terkirim!</h2>
            <p>Terima kasih atas partisipasi Anda. Tim kami akan segera menindaklanjuti laporan ini.</p>
          </div>
        ) : (
          <form className="laporan-form" onSubmit={handleSubmit}>
            {error && <div className="laporan-error-message" style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label>Jenis Pelaporan</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">Pilih Jenis Masalah</option>
                  <option value="pencemaran_air">Pencemaran Air Sungai</option>
                  <option value="limbah_pabrik">Pembuangan Limbah Pabrik</option>
                  <option value="sampah_ilegal">Pembuangan Sampah Ilegal</option>
                  <option value="kerusakan_lahan">Kerusakan Lahan Sawah</option>
                  <option value="lainnya">Masalah Lingkungan Lainnya</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tingkat Urgensi</label>
                <div className="urgency-selector">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`urgency-btn ${level} ${formData.urgency === level ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, urgency: level })}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Lokasi Kejadian</label>
              <div className="input-with-icon">
                <MapPin size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="Contoh: Pinggiran Sungai Sempor RT 02"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Deskripsi Masalah</label>
              <textarea
                placeholder="Jelaskan secara detail masalah yang Anda temukan..."
                rows="5"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="multiple-upload-section">
              <label className="upload-label">Unggah Foto Bukti </label>
              <div className="previews-grid">
                {previews.map((src, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={src} alt={`Preview ${index}`} />
                    <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="add-image-box">
                  <ImageIcon size={24} />
                  <span>Tambah Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <div className="disclaimer">
                <AlertTriangle size={16} />
                <span>Pastikan data yang Anda kirimkan benar dan dapat dipertanggungjawabkan.</span>
              </div>
              <button type="submit" className="submit-laporan-btn" disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Laporan Sekarang'}
                {!loading && <Send size={18} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
