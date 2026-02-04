const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // This will now store the Nickname
  email: { type: String, required: true, unique: true },
  dauthId: { type: String, required: true },
  gender: { type: String },
  avatar: { type: String }, // <--- NEW FIELD
  
  onboardingComplete: { type: Boolean, default: false },
  
  answers: [{
    questionId: { type: Number },
    questionType: { type: String, enum: ['selection', 'text'], default: 'selection' },
    selectedOptions: [{ type: String }],
    textAnswer: { type: String }
  }],

  // ... (keep existing relationship fields: sentRequests, receivedRequests, matches) ...
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);