const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.dauthLogin = async (req, res) => {
    console.log("hi")
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing" });
  }

  try {
    // Step 1: Exchange Code for Access Token
    const tokenResponse = await axios.post(
      'https://auth.delta.nitt.edu/api/oauth/token',
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

    // Step 2: Get User Details using the Access Token
    const userResponse = await axios.post(
      'https://auth.delta.nitt.edu/api/resources/user',
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const deltaUser = userResponse.data;

    // Step 3: Find or Create User in MongoDB
    let user = await User.findOne({ email: deltaUser.email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        name: deltaUser.name,
        email: deltaUser.email,
        dauthId: deltaUser.id,
        gender: deltaUser.gender,
        onboardingComplete: false
      });
    }

    // Step 4: Generate JWT for YOUR app
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Send back the token and whether they need to finish onboarding
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        onboardingComplete: user.onboardingComplete
      }
    });

  } catch (error) {
    console.error("DAuth Login Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Authentication failed" });
  }
};