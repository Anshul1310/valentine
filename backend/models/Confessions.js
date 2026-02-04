const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  
  // Array of User IDs who liked
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Confession', confessionSchema);