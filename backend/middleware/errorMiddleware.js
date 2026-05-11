const multer = require('multer');

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Ukuran file terlalu besar. Maksimal 20MB per file.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  next(err);
};

module.exports = { multerErrorHandler };
