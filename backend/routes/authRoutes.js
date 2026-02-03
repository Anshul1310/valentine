const express = require('express');
const router = express.Router();
const { dauthLogin } = require('../controllers/authController');

// POST /api/auth/dauth
router.post('/dauth', dauthLogin);

module.exports = router;