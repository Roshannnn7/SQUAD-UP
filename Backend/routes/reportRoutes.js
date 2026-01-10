const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');

// User routes
router.post('/', protect, createReport);

// Admin routes
router.get('/', protect, admin, getReports);
router.get('/:id', protect, admin, getReportById);
router.put('/:id', protect, admin, updateReport);
router.delete('/:id', protect, admin, deleteReport);

module.exports = router;
