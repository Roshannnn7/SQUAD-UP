const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTemplates,
    createSquadFromTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} = require('../controllers/templateController');

router.get('/', getTemplates);
router.post('/:id/create-squad', protect, createSquadFromTemplate);
router.post('/', protect, createTemplate);
router.put('/:id', protect, updateTemplate);
router.delete('/:id', protect, deleteTemplate);

module.exports = router;
