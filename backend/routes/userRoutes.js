const express = require('express');
const router = express.Router();
// Import updateProfile
const { getMe, updateGender, saveAnswers, getMatches, sendInvite, acceptInvite, updateProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.put('/gender', protect, updateGender);
router.post('/answers', protect, saveAnswers);

// New Route for updating Nickname/Avatar
router.put('/profile', protect, updateProfile); 

router.get('/matches', protect, getMatches);
router.post('/invite/:id', protect, sendInvite);
router.post('/accept/:id', protect, acceptInvite);

module.exports = router;