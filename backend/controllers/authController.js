const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- Helper for Random Nicknames ---
const ADJECTIVES = ['Happy', 'Cool', 'Lazy', 'Speedy', 'Lucky', 'Sunny', 'Wild', 'Calm', 'Brave', 'Smart'];
const ANIMALS = ['Panda', 'Tiger', 'Eagle', 'Fox', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Koala', 'Cat'];

const generateRandomNickname = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj} ${animal} ${num}`;
};

const generateRandomAvatar = (gender) => {
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
};

// Map Delta's "Male/Female" to App's "Man/Woman"
const mapGender = (deltaGender) => {
  if (!deltaGender) return 'Non-binary';
  const g = deltaGender.toLowerCase();
  if (g === 'male') return 'Man';
  if (g === 'female') return 'Woman';
  return 'Non-binary';
};
// ------------------------------------

exports.dauthLogin = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing" });
  }

  try {
    // Step 1: Exchange Code for Token
    const tokenResponse = await axios.post(
      process.env.DAUTH_TOKEN_URL,
      new URLSearchParams({
        client_id: process.env.DAUTH_CLIENT_ID,
        client_secret: process.env.DAUTH_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DAUTH_REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Get User Details
    const userResponse = await axios.post(
      process.env.DAUTH_USER_URL,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const deltaUser = userResponse.data;

    // Step 3: Find or Create User
    let user = await User.findOne({ email: deltaUser.email });

    if (!user) {
      const randomNick = generateRandomNickname();
      // Ensure gender matches app format (Man/Woman)
      const mappedGender = mapGender(deltaUser.gender);
      const randomAvatar = generateRandomAvatar(deltaUser.gender);

      user = await User.create({
        name: randomNick,
        email: deltaUser.email,
        dauthId: deltaUser.id,
        gender: mappedGender, // Saving mapped gender directly
        avatar: randomAvatar,
        onboardingComplete: false
      });
    }

    // Step 4: Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        onboardingComplete: user.onboardingComplete
      }
    });

  } catch (error) {
    console.error("DAuth Login Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Authentication failed" });
  }
};