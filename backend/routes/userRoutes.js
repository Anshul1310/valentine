const express = require('express');
const router = express.Router();
const { getMe, updateGender, saveAnswers, getMatches, sendInvite, acceptInvite } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.put('/gender', protect, updateGender);
router.post('/answers', protect, saveAnswers);

// New Routes
router.get('/matches', protect, getMatches);
router.post('/invite/:id', protect, sendInvite);
router.post('/accept/:id', protect, acceptInvite);

module.exports = router;