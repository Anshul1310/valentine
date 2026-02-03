const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dauthId: { type: String, required: true },
  gender: { type: String },
  
  onboardingComplete: { type: Boolean, default: false },
  
  answers: [{
    questionId: { type: Number },
    questionType: { type: String, enum: ['selection', 'text'], default: 'selection' },
    selectedOptions: [{ type: String }],
    textAnswer: { type: String }
  }],

  // --- NEW FIELDS ---
  // Users I have sent an invite to
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Users who have sent me an invite
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Confirmed matches (Chat allowed)
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // ------------------

  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);