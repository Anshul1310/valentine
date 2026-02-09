const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { 
  getConfessions, 
  createConfession, 
  likeConfession, 
  commentConfession,
  reportConfession, // Import the new function
  getQuota 
} = require('../controllers/confessionController');

router.get('/', protect, getConfessions);
router.post('/', protect, createConfession);
router.get('/quota', protect, getQuota);
router.put('/:id/like', protect, likeConfession);
router.post('/:id/comment', protect, commentConfession);
router.post('/:id/report', protect, reportConfession); // Add the route

module.exports = router;