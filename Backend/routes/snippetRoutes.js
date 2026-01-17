const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createSnippet,
    getProjectSnippets,
    updateSnippet,
    deleteSnippet,
} = require('../controllers/snippetController');

router.post('/', protect, createSnippet);
router.get('/project/:projectId', protect, getProjectSnippets);
router.put('/:id', protect, updateSnippet);
router.delete('/:id', protect, deleteSnippet);

module.exports = router;
