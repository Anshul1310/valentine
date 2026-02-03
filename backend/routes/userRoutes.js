const express = require('express');
const router = express.Router();
const { getMe, saveAnswers, updateGender } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.put('/gender', protect, updateGender); // New Route
router.post('/answers', protect, saveAnswers);

module.exports = router;