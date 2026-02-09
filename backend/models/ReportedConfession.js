const mongoose = require('mongoose');

const reportedConfessionSchema = new mongoose.Schema({
  confession: { type: mongoose.Schema.Types.ObjectId, ref: 'Confession', required: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: 'Inappropriate content' },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportedConfession', reportedConfessionSchema);