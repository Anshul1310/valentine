// backend/controllers/userController.js
const User = require('../models/User');
const Message = require('../models/Message');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateGender = async (req, res) => {
  try {
    const { gender } = req.body;
    await User.findByIdAndUpdate(req.user.id, { gender });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

exports.saveAnswers = async (req, res) => {
  try {
    const { answers } = req.body;
    await User.findByIdAndUpdate(req.user.id, { answers, onboardingComplete: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatar } = req.body;

    if (!nickname || !avatar) {
      return res.status(400).json({ message: "Nickname and avatar are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: nickname, avatar: avatar },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: {
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        onboardingComplete: updatedUser.onboardingComplete
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// --- MATCHING & MESSAGES ---

exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate('receivedRequests', 'name gender avatar answers')
      .populate('sentRequests', 'name gender avatar answers')
      .populate('matches', 'name gender avatar');

    // Fetch Last Message & Unread Count for Matches
    const matchesWithMessages = await Promise.all(currentUser.matches.map(async (match) => {
      // 1. Get Last Message
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: currentUser._id, receiverId: match._id },
          { senderId: match._id, receiverId: currentUser._id }
        ]
      }).sort({ timestamp: -1 });

      // 2. Count Unread Messages (Where I am the receiver and sender is the match)
      const unreadCount = await Message.countDocuments({
        senderId: match._id,
        receiverId: currentUser._id,
        isRead: false
      });

      return {
        ...match.toObject(),
        lastMessage: lastMsg ? lastMsg.text : "Tap to start chatting! 👋",
        lastMessageTime: lastMsg ? lastMsg.timestamp : null,
        unreadCount: unreadCount // Add count to response
      };
    }));
    
    // Sort matches by latest message time
    matchesWithMessages.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : 0;
      return timeB - timeA;
    });

    // Recommendation Logic (Standard)
    let targetGender;
    if (currentUser.gender === 'Man') targetGender = 'Woman';
    else if (currentUser.gender === 'Woman') targetGender = 'Man';
    else targetGender = ['Man', 'Woman', 'Non-binary'];

    const excludeIds = [
      currentUser._id,
      ...currentUser.sentRequests.map(u => u._id), 
      ...currentUser.receivedRequests.map(u => u._id),
      ...currentUser.matches.map(u => u._id)
    ];

    const candidates = await User.find({
      gender: targetGender,
      _id: { $nin: excludeIds },
      onboardingComplete: true
    });

    const mySelections = currentUser.answers
      .filter(a => a.questionType === 'selection')
      .flatMap(a => a.selectedOptions);

    const scoredCandidates = candidates.map(user => {
      const theirSelections = user.answers
        .filter(a => a.questionType === 'selection')
        .flatMap(a => a.selectedOptions);
      
      const common = mySelections.filter(opt => theirSelections.includes(opt));
      
      return {
        _id: user._id,
        name: user.name,
        gender: user.gender,
        avatar: user.avatar,
        matchCount: common.length,
        commonInterests: common.slice(0, 3),
        answers: user.answers 
      };
    });

    scoredCandidates.sort((a, b) => b.matchCount - a.matchCount);

    res.status(200).json({
      pending: currentUser.receivedRequests, 
      sent: currentUser.sentRequests,
      recommendations: scoredCandidates,
      matches: matchesWithMessages 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
};

exports.sendInvite = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user.id;

    await User.findByIdAndUpdate(currentId, { $addToSet: { sentRequests: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { receivedRequests: currentId } });

    res.status(200).json({ success: true, message: "Invitation sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send invite" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const requesterId = req.params.id; 
    const currentId = req.user.id;

    await User.findByIdAndUpdate(currentId, { 
      $addToSet: { matches: requesterId },
      $pull: { receivedRequests: requesterId } 
    });

    await User.findByIdAndUpdate(requesterId, { 
      $addToSet: { matches: currentId },
      $pull: { sentRequests: currentId } 
    });

    res.status(200).json({ success: true, message: "It's a match!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept invite" });
  }
};