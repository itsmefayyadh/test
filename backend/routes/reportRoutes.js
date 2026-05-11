const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', auth, upload.array('images', 10), reportController.createReport);
router.get('/', auth, reportController.getReports);
router.patch('/:id/status', auth, reportController.updateReportStatus);
router.delete('/:id', auth, reportController.deleteReport);

module.exports = router;
