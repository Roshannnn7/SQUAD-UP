const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addResource,
    getProjectResources,
    voteResource,
    deleteResource,
} = require('../controllers/resourceController');

router.post('/', protect, addResource);
router.get('/project/:projectId', protect, getProjectResources);
router.post('/:id/vote', protect, voteResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
