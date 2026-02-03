const User = require('../models/User');

// ... (keep getMe, updateGender, saveAnswers as they are) ...

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


// --- NEW FUNCTIONS ---

// GET /api/user/matches

// ... (Other functions like getMe, updateGender, saveAnswers remain same) ...

exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate('receivedRequests', 'name gender answers')
      .populate('sentRequests', 'name gender answers') // <--- NEW: Populate Sent Requests
      .populate('matches', 'name gender');

    let targetGender;
    if (currentUser.gender === 'Man') targetGender = 'Woman';
    else if (currentUser.gender === 'Woman') targetGender = 'Man';
    else targetGender = ['Man', 'Woman', 'Non-binary'];

    const excludeIds = [
      currentUser._id,
      ...currentUser.sentRequests.map(u => u._id), // Ensure we exclude full objects
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
        matchCount: common.length,
        commonInterests: common.slice(0, 3),
        answers: user.answers 
      };
    });

    scoredCandidates.sort((a, b) => b.matchCount - a.matchCount);

    res.status(200).json({
      pending: currentUser.receivedRequests, 
      sent: currentUser.sentRequests, // <--- Now contains full user details
      recommendations: scoredCandidates
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
};



// POST /api/user/invite/:id
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

// POST /api/user/accept/:id
exports.acceptInvite = async (req, res) => {
  try {
    const requesterId = req.params.id; // The person who sent me the invite
    const currentId = req.user.id;

    // 1. Add to 'matches' for both
    await User.findByIdAndUpdate(currentId, { 
      $addToSet: { matches: requesterId },
      $pull: { receivedRequests: requesterId } // Remove from pending
    });

    await User.findByIdAndUpdate(requesterId, { 
      $addToSet: { matches: currentId },
      $pull: { sentRequests: currentId } // Remove from their sent
    });

    res.status(200).json({ success: true, message: "It's a match!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept invite" });
  }
};