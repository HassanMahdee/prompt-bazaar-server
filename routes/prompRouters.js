const express = require('express');
const router = express.Router();
const { getPrompts, getAnalytics } = require('../controllers/promptController');

// Map endpoints cleanly onto controller behaviors
router.get('/', getPrompts);
router.get('/analytics', getAnalytics);

module.exports = router;