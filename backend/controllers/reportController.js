const db = require('../config/db');
const supabase = require('../config/supabase');

exports.createReport = async (req, res) => {
  const { type, urgency, location, description } = req.body;
  const user_id = req.user.id;

  try {
    let imageUrls = null;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        const { error } = await supabase.storage
          .from('laporan-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) throw new Error(`Upload failed: ${error.message}`);

        const { data: publicData } = supabase.storage
          .from('laporan-images')
          .getPublicUrl(fileName);

        return publicData.publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      imageUrls = urls.join(',');
    }

    const result = await db.query(
      'INSERT INTO reports (user_id, type, urgency, location, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, type, urgency, location, description, imageUrls]
    );

    res.status(201).json({
      message: 'Laporan berhasil dikirim',
      report: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengirim laporan' });
  }
};

exports.getReports = async (req, res) => {
  try {
    let query = 'SELECT r.*, u.username FROM reports r JOIN users u ON r.user_id = u.id';
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE r.user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data laporan' });
  }
};

exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya Admin yang dapat mengubah status laporan' });
  }

  const validStatus = ['pending', 'in_progress', 'resolved'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }

  try {
    const result = await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }

    res.json({
      message: 'Status laporan berhasil diperbarui',
      report: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui status laporan' });
  }
};

exports.deleteReport = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM reports WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laporan tidak ditemukan' });
    }
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus laporan' });
  }
};
