// backend/controllers/userController.js
const User = require('../models/User');

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

// --- NEW: Update Profile (Nickname & Avatar) ---
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatar } = req.body;

    if (!nickname || !avatar) {
      return res.status(400).json({ message: "Nickname and avatar are required" });
    }

    // Update the 'name' field (used as nickname) and 'avatar'
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: nickname, avatar: avatar },
      { new: true } // Return the updated document
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
    // 1. Fetch current user and populate lists with Avatar + Name
    const currentUser = await User.findById(req.user.id)
      .populate('receivedRequests', 'name gender avatar answers') // Added avatar
      .populate('sentRequests', 'name gender avatar answers')     // Added avatar
      .populate('matches', 'name gender avatar');                 // Added avatar

    // 2. Determine target gender for recommendations
    let targetGender;
    if (currentUser.gender === 'Man') targetGender = 'Woman';
    else if (currentUser.gender === 'Woman') targetGender = 'Man';
    else targetGender = ['Man', 'Woman', 'Non-binary'];

    // 3. Exclude people we already know from recommendations
    const excludeIds = [
      currentUser._id,
      ...currentUser.sentRequests.map(u => u._id), 
      ...currentUser.receivedRequests.map(u => u._id),
      ...currentUser.matches.map(u => u._id)
    ];

    // 4. Find Candidates
    const candidates = await User.find({
      gender: targetGender,
      _id: { $nin: excludeIds },
      onboardingComplete: true
    });

    // 5. Score Candidates (Common Interests)
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
        avatar: user.avatar,  // <--- Added Avatar here
        matchCount: common.length,
        commonInterests: common.slice(0, 3),
        answers: user.answers 
      };
    });

    // Sort by best match
    scoredCandidates.sort((a, b) => b.matchCount - a.matchCount);

    // 6. Send Response
    res.status(200).json({
      pending: currentUser.receivedRequests, 
      sent: currentUser.sentRequests,
      recommendations: scoredCandidates,
      matches: currentUser.matches 
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

    // Add target to my 'sentRequests'
    await User.findByIdAndUpdate(currentId, { $addToSet: { sentRequests: targetId } });
    
    // Add me to target's 'receivedRequests'
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

    // Add to 'matches' for both and remove from pending/sent lists
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