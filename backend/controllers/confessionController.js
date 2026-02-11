const mongoose = require('mongoose');
const Confession = require('../models/Confession');
const ReportedConfession = require('../models/ReportedConfession');

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
    const { sortBy } = req.query; // 'popular' or 'recent'

    // Determine sort order
    let sortStage = { createdAt: -1 }; // Default to Recent
    if (sortBy === 'popular') {
      // Sort by likes, then comments, then newest
      sortStage = { likesCount: -1, commentsCount: -1, createdAt: -1 };
    }

    const confessions = await Confession.aggregate([
      // 1. Join with Users to get author gender
      {
        $lookup: {
          from: 'users', 
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      { $unwind: '$authorDetails' }, // Flatten the array
      
      // 2. Add calculated fields
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
          isLikedByMe: { $in: [new mongoose.Types.ObjectId(req.user.id), { $ifNull: ["$likes", []] }] },
          "authorGender": "$authorDetails.gender" // Project specifically for the UI
        }
      },

      // 3. Sort based on the tab selected
      { $sort: sortStage }
      
      // Removed $limit to show all confessions
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

// POST /api/confessions/:id/report
exports.reportConfession = async (req, res) => {
  try {
    const { reason } = req.body;
    const confessionId = req.params.id;
    const userId = req.user.id;

    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    const existingReport = await ReportedConfession.findOne({ 
      confession: confessionId, 
      reporter: userId 
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this confession." });
    }

    const newReport = new ReportedConfession({
      confession: confessionId,
      reporter: userId,
      reason: reason || "Inappropriate content"
    });

    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully." });

  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: "Error submitting report" });
  }
};