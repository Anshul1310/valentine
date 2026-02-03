const mongoose = require('mongoose'); // <--- Added this import
const Confession = require('../models/Confession');

// GET /api/confessions/quota
exports.getQuota = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Confession.countDocuments({
      author: req.user.id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const limit = 2;
    res.status(200).json({ 
      remaining: Math.max(0, limit - count),
      limit: limit 
    });
  } catch (error) {
    console.error("Quota Error:", error);
    res.status(500).json({ message: "Error fetching quota" });
  }
};

// GET /api/confessions
exports.getConfessions = async (req, res) => {
  try {
    const confessions = await Confession.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          // Now 'mongoose' is defined, so this works:
          isLikedByMe: { $in: [new mongoose.Types.ObjectId(req.user.id), "$likes"] }
        }
      },
      { $sort: { likesCount: -1, commentsCount: -1, createdAt: -1 } },
      { $limit: 50 }
    ]);

    // Populate Comment Authors
    await Confession.populate(confessions, {
      path: 'comments.author',
      select: 'name gender'
    });

    res.status(200).json(confessions);
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({ message: "Error loading confessions" });
  }
};

// POST /api/confessions
exports.createConfession = async (req, res) => {
  try {
    const { content } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Confession.countDocuments({
      author: req.user.id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (count >= 2) {
      return res.status(403).json({ message: "Daily limit reached (2/2)." });
    }

    const newConfession = new Confession({
      author: req.user.id,
      content
    });

    await newConfession.save();
    res.status(201).json(newConfession);

  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: "Failed to post" });
  }
};

// PUT /api/confessions/:id/like
exports.likeConfession = async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    if (confession.likes.includes(req.user.id)) {
      confession.likes.pull(req.user.id);
    } else {
      confession.likes.push(req.user.id);
    }

    await confession.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Error liking" });
  }
};

// POST /api/confessions/:id/comment
exports.commentConfession = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    const confession = await Confession.findById(req.params.id);
    
    confession.comments.push({
      author: req.user.id,
      text
    });

    await confession.save();
    
    const updated = await Confession.findById(req.params.id).populate('comments.author', 'name gender');
    res.status(200).json(updated.comments);
  } catch (error) {
    console.error("Comment Error:", error);
    res.status(500).json({ message: "Error commenting" });
  }
};