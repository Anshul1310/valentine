// backend/controllers/chatController.js
// backend/controllers/chatController.js
const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { before } = req.query;

    // Identify current user and the "other" user
    // req.user is provided by the 'protect' middleware
    const currentUserId = req.user ? req.user.id : null;
    let otherUserId;

    // Determine otherUserId based on the route params
    if (currentUserId === user1) {
      otherUserId = user2;
    } else if (currentUserId === user2) {
      otherUserId = user1;
    } else {
      // Fallback if current user isn't in the params (shouldn't happen with correct routing)
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 1. Build the base query for the conversation
    const query = {
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    };

    // 2. Count unread messages (ONLY for the initial load, i.e., when 'before' is not set)
    let unreadCount = 0;
    if (!before && currentUserId) {
      unreadCount = await Message.countDocuments({
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false
      });

      // 3. Mark messages as read immediately after counting
      if (unreadCount > 0) {
        await Message.updateMany(
          { senderId: otherUserId, receiverId: currentUserId, isRead: false },
          { $set: { isRead: true } }
        );
      }
    }

    // 4. Add pagination to the query
    // If 'before' exists, we want messages strictly OLDER than that timestamp
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // 5. Fetch messages (newest first, then reverse)
    const messages = await Message.find(query)
      .sort({ timestamp: -1 }) // Newest first
      .limit(20);              // Limit to 20

    // 6. Return formatted response
    // We reverse the array so the frontend gets them in chronological order [Oldest ... Newest]
    res.json({
      messages: messages.reverse(),
      unreadCount: unreadCount // Include the count we found earlier
    });
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};