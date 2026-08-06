const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createEvent,
    getProjectEvents,
    rsvpEvent,
    deleteEvent,
} = require('../controllers/eventController');

router.post('/', protect, createEvent);
router.get('/project/:projectId', protect, getProjectEvents);
router.put('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
