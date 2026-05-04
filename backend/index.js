const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const db = require('./db');
const auth = require('./auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase client (server-side, uses service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Multer: store in memory (for Supabase upload, no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PetaApp API' });
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const userQuery = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [identifier, identifier]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const user = userQuery.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username atau Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
});

// Reports Endpoints
app.post('/api/reports', auth, upload.array('images', 10), async (req, res) => {
  const { type, urgency, location, description } = req.body;
  const user_id = req.user.id;

  try {
    let imageUrls = null;

    // Upload images to Supabase Storage
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
});

app.get('/api/reports', auth, async (req, res) => {
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
});

// Update Report Status (Admin Only)
app.patch('/api/reports/:id/status', auth, async (req, res) => {
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
});

app.delete('/api/reports/:id', auth, async (req, res) => {
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
});

// Manage Users (Admin Only)
app.post('/api/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });

  const { username, email, password, role } = req.body;
  try {
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'Username/Email sudah terdaftar' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, role || 'user']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat user' });
  }
});

app.put('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak' });

  const { id } = req.params;
  const { username, email, role, password } = req.body;
  try {
    let query = 'UPDATE users SET username = $1, email = $2, role = $3';
    let params = [username, email, role, id];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $4 WHERE id = $5 RETURNING id, username, email, role, created_at';
      params = [username, email, role, hashedPassword, id];
    } else {
      query += ' WHERE id = $4 RETURNING id, username, email, role, created_at';
    }

    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui user' });
  }
});

app.get('/api/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  try {
    const result = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

app.delete('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
  }

  try {
    await db.query('DELETE FROM reports WHERE user_id = $1', [id]);
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

// DB connection test
app.get('/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      status: 'Database Connected',
      time: result.rows[0].now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Multer Error Handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 20MB per file.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  next(err);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
