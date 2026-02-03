const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dauthId: { type: String, required: true }, // Store Delta's unique user ID
  gender: { type: String }, // Delta provides this
  
  // App specific fields
  onboardingComplete: { type: Boolean, default: false },
  role: { type: String, default: 'student' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);