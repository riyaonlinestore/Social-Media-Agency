const Client = require("../models/Client");
const Post = require("../models/post");

// =========================
// GET DASHBOARD STATS
// =========================
const getDashboardStats = async (req, res) => {
  try {
    const totalClients = await Client.countDocuments({
      createdBy: req.user.id
    });

    const totalPosts = await Post.countDocuments({
      createdBy: req.user.id
    });

    const pendingApprovals = await Post.countDocuments({
      createdBy: req.user.id,
      status: "pending_approval"
    });

    const approvedPosts = await Post.countDocuments({
      createdBy: req.user.id,
      status: "approved"
    });

    const rejectedPosts = await Post.countDocuments({
      createdBy: req.user.id,
      status: "rejected"
    });

    const scheduledPosts = await Post.countDocuments({
      createdBy: req.user.id,
      status: "scheduled"
    });

    return res.status(200).json({
      message: "Dashboard stats fetched successfully",
      stats: {
        totalClients,
        totalPosts,
        pendingApprovals,
        approvedPosts,
        rejectedPosts,
        scheduledPosts
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};