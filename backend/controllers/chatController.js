// backend/controllers/chatController.js
const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { before } = req.query;

    // 1. Mark messages as read
    // If we have the current user's ID from auth middleware (req.user), 
    // we can specifically mark messages sent by the 'other' person as read.
    // Assuming user1 is the one requesting (or we check req.user.id)
    
    // Note: To be safe, we determine the "other" user.
    // If the requester is user1, then user2 is the sender of unread messages.
    // If req.user is available (which it should be via middleware):
    if (req.user && req.user.id) {
       const otherUserId = (req.user.id === user1) ? user2 : user1;
       
       await Message.updateMany(
         { senderId: otherUserId, receiverId: req.user.id, isRead: false },
         { $set: { isRead: true } }
       );
    }

    // 2. Build Query
    let query = {
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    };

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // 3. Fetch from DB
    const messages = await Message.find(query)
      .sort({ timestamp: -1 }) 
      .limit(20);              

    // 4. Reverse to Chronological Order
    res.json(messages.reverse());
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};