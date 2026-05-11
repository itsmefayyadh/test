const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.createUser = async (req, res) => {
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
};

exports.updateUser = async (req, res) => {
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
};

exports.getUsers = async (req, res) => {
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
};

exports.deleteUser = async (req, res) => {
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
};
