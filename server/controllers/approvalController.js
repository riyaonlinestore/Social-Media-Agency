const Approval = require("../models/Approval.js");
const Post = require("../models/post.js");
const Client = require("../models/Client");

// DEBUG CHECK
console.log("Approval model:", Approval);
console.log("Approval.find type:", typeof Approval.find);

// =====================================================
// CREATE APPROVAL REQUEST - AGENCY ONLY
// =====================================================

const createApproval = async (req, res) => {
  try {
    const { post, client } = req.body;

    if (!post || !client) {
      return res.status(400).json({
        message: "Post and client are required"
      });
    }

    const existingPost = await Post.findById(post);

    if (!existingPost) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const existingApproval = await Approval.findOne({
      post
    });

    if (existingApproval) {
      return res.status(400).json({
        message: "Approval request already exists"
      });
    }

    const approval = await Approval.create({
      post,
      client,
      status: "pending"
    });

    await Post.findByIdAndUpdate(post, {
      status: "pending_approval"
    });

    return res.status(201).json({
      message: "Approval request created successfully",
      approval
    });

  } catch (error) {
    console.error("CREATE APPROVAL ERROR:", error);

    return res.status(500).json({
      message: "Failed to create approval request",
      error: error.message
    });
  }
};


// =====================================================
// GET ALL APPROVALS - AGENCY ONLY
// =====================================================

const getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find()
      .populate("post")
      .populate("client")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Approvals fetched successfully",
      approvals
    });

  } catch (error) {
    console.error("GET APPROVALS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch approvals",
      error: error.message
    });
  }
};


// =====================================================
// GET APPROVALS FOR LOGGED-IN CLIENT
// =====================================================

const getClientApprovals = async (req, res) => {
  try {
    const client = await Client.findOne({
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        message: "Client profile not found"
      });
    }

    const approvals = await Approval.find({
      client: client._id
    })
      .populate("post")
      .populate("client")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Client approvals fetched successfully",
      approvals
    });

  } catch (error) {
    console.error("GET CLIENT APPROVALS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch client approvals",
      error: error.message
    });
  }
};


// =====================================================
// APPROVE POST - CLIENT ONLY
// =====================================================

const approvePost = async (req, res) => {
  try {
    const client = await Client.findOne({
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        message: "Client profile not found"
      });
    }

    const approval = await Approval.findOne({
      _id: req.params.id,
      client: client._id
    });

    if (!approval) {
      return res.status(404).json({
        message: "Approval request not found"
      });
    }

    approval.status = "approved";

    if (req.body.feedback) {
      approval.feedback = req.body.feedback;
    }

    await approval.save();

    await Post.findByIdAndUpdate(approval.post, {
      status: "approved"
    });

    return res.status(200).json({
      message: "Post approved successfully",
      approval
    });

  } catch (error) {
    console.error("APPROVE POST ERROR:", error);

    return res.status(500).json({
      message: "Failed to approve post",
      error: error.message
    });
  }
};


// =====================================================
// REJECT POST - CLIENT ONLY
// =====================================================

const rejectPost = async (req, res) => {
  try {
    const client = await Client.findOne({
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        message: "Client profile not found"
      });
    }

    const approval = await Approval.findOne({
      _id: req.params.id,
      client: client._id
    });

    if (!approval) {
      return res.status(404).json({
        message: "Approval request not found"
      });
    }

    approval.status = "rejected";
    approval.feedback = req.body.feedback || "";

    await approval.save();

    await Post.findByIdAndUpdate(approval.post, {
      status: "rejected"
    });

    return res.status(200).json({
      message: "Post rejected successfully",
      approval
    });

  } catch (error) {
    console.error("REJECT POST ERROR:", error);

    return res.status(500).json({
      message: "Failed to reject post",
      error: error.message
    });
  }
};


// =====================================================
// ADD FEEDBACK - CLIENT ONLY
// =====================================================

const addFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        message: "Feedback is required"
      });
    }

    const client = await Client.findOne({
      userId: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        message: "Client profile not found"
      });
    }

    const approval = await Approval.findOne({
      _id: req.params.id,
      client: client._id
    });

    if (!approval) {
      return res.status(404).json({
        message: "Approval request not found"
      });
    }

    approval.feedback = feedback.trim();

    await approval.save();

    return res.status(200).json({
      message: "Feedback added successfully",
      approval
    });

  } catch (error) {
    console.error("ADD FEEDBACK ERROR:", error);

    return res.status(500).json({
      message: "Failed to add feedback",
      error: error.message
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createApproval,
  getApprovals,
  getClientApprovals,
  approvePost,
  rejectPost,
  addFeedback
};