const express = require('express');
const router = express.Router();
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    createPaymentIntent,
    completeBooking,
} = require('../controllers/bookingController');
const { protect, mentor } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, mentor, updateBookingStatus);
router.post('/:id/payment', protect, createPaymentIntent);
router.put('/:id/complete', protect, completeBooking);

module.exports = router;
