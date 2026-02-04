// backend/controllers/chatController.js
const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { before } = req.query; // Timestamp cursor for pagination

    // 1. Build Query
    // Find messages between these two users (sent by either)
    let query = {
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    };

    // 2. Pagination Logic
    // If 'before' is provided, fetch messages older than that timestamp
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // 3. Fetch from DB
    const messages = await Message.find(query)
      .sort({ timestamp: -1 }) // Get newest first (to grab the chunk)
      .limit(20);              // Limit to 20

    // 4. Reverse to Chronological Order
    // We fetched "Newest -> Oldest" for efficient querying, 
    // but the frontend needs "Oldest -> Newest" to display top-to-bottom.
    res.json(messages.reverse());
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};