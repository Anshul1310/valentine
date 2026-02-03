const User = require('../models/User');

// GET /api/user/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json({
      id: user._id,
      name: user.name,
      gender: user.gender, // Send gender to frontend to check if it's set
      onboardingComplete: user.onboardingComplete
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// PUT /api/user/gender
exports.updateGender = async (req, res) => {
  try {
    const { gender } = req.body;
    if (!gender) return res.status(400).json({ message: "Gender is required" });

    await User.findByIdAndUpdate(req.user.id, { gender });
    res.status(200).json({ success: true, message: "Gender updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update gender" });
  }
};

// POST /api/user/answers
exports.saveAnswers = async (req, res) => {
  try {
    const { answers } = req.body; 
    // Expecting: [{ questionId: 1, questionType: 'text', textAnswer: '...' }, ...]

    await User.findByIdAndUpdate(req.user.id, {
      answers: answers,
      onboardingComplete: true
    });

    res.status(200).json({ success: true, message: "Answers saved" });
  } catch (error) {
    console.error("Save Answers Error:", error);
    res.status(500).json({ message: "Failed to save answers" });
  }
};