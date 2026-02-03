const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
  getConfessions, 
  createConfession, 
  likeConfession, 
  commentConfession,
  getQuota 
} = require('../controllers/confessionController');

router.get('/', protect, getConfessions);
router.post('/', protect, createConfession);
router.get('/quota', protect, getQuota);
router.put('/:id/like', protect, likeConfession);
router.post('/:id/comment', protect, commentConfession);

module.exports = router;