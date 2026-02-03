const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dauthId: { type: String, required: true }, 
  
  // Gender can be from DAuth or manually selected
  gender: { type: String }, 
  
  onboardingComplete: { type: Boolean, default: false },
  
  // Updated Answers Schema to support both Options and Text
  answers: [{
    questionId: { type: Number },
    questionType: { type: String, enum: ['selection', 'text'], default: 'selection' },
    selectedOptions: [{ type: String }], // For Multiple Choice
    textAnswer: { type: String }         // For Descriptive
  }],

  role: { type: String, default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);