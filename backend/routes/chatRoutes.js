// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

// GET /api/chat/history/:user1/:user2?before=TIMESTAMP
router.get('/history/:user1/:user2', protect, getMessages);

module.exports = router;