const Post = require("../models/post.js");
const Client = require("../models/Client");
const Approval = require("../models/Approval");

// =========================
// CREATE POST
// =========================
const createPost = async (req, res) => {
  try {
    const {
      client,
      title,
      caption,
      hashtags,
      contentType,
      mediaUrl,
      status,
      scheduledDate
    } = req.body;

    if (!client || !title) {
      return res.status(400).json({
        message: "Client and title are required"
      });
    }

    // CHECK CLIENT
    const clientData = await Client.findOne({
      _id: client,
      createdBy: req.user.id
    });

    if (!clientData) {
      return res.status(404).json({
        message: "Client not found or not assigned to your agency"
      });
    }

    // CREATE POST
    const post = await Post.create({
      client: clientData._id,
      createdBy: req.user.id,
      title,
      caption,
      hashtags,
      contentType,
      mediaUrl,
      status: status || "draft",
      scheduledDate
    });

    const populatedPost = await Post.findById(post._id)
      .populate(
        "client",
        "name email companyName userId"
      );

    return res.status(201).json({
      message: "Post created successfully",
      post: populatedPost
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return res.status(500).json({
      message: "Failed to create post",
      error: error.message
    });
  }
};


// =========================
// GET ALL POSTS - AGENCY
// =========================
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      createdBy: req.user.id
    })
      .populate(
        "client",
        "name email companyName userId"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Posts fetched successfully",
      posts
    });

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message
    });
  }
};


// =========================
// GET CLIENT POSTS
// =========================
// Logged-in client ko sirf uske posts milenge
// aur har post ke saath approvalId bhi milega.
const getClientPosts = async (req, res) => {
  try {

    // =========================================
    // FIND CLIENT USING LOGGED-IN USER ID
    // =========================================
    const clientData = await Client.findOne({
      userId: req.user.id
    });

    if (!clientData) {
      return res.status(404).json({
        message: "Client profile not found"
      });
    }

    // =========================================
    // FIND CLIENT POSTS
    // =========================================
    const posts = await Post.find({
      client: clientData._id
    })
      .populate(
        "client",
        "name email companyName userId"
      )
      .sort({ createdAt: -1 });

    // =========================================
    // FIND APPROVALS FOR THESE POSTS
    // =========================================
    const postIds = posts.map(
      (post) => post._id
    );

    const approvals = await Approval.find({
      post: { $in: postIds },
      client: clientData._id
    });

    // =========================================
    // ADD approvalId TO EACH POST
    // =========================================
    const postsWithApproval = posts.map(
      (post) => {

        const approval = approvals.find(
          (item) =>
            item.post.toString() ===
            post._id.toString()
        );

        return {
          ...post.toObject(),

          // Approval ID frontend ko milega
          approvalId: approval
            ? approval._id
            : null,

          // Approval status bhi frontend ko milega
          approvalStatus: approval
            ? approval.status
            : null,

          // Feedback bhi milega
          approvalFeedback: approval
            ? approval.feedback
            : ""
        };
      }
    );

    return res.status(200).json({
      message: "Client posts fetched successfully",
      posts: postsWithApproval
    });

  } catch (error) {
    console.error(
      "GET CLIENT POSTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch client posts",
      error: error.message
    });
  }
};


// =========================
// GET SINGLE POST
// =========================
const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate(
      "client",
      "name email companyName userId"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    return res.status(200).json({
      message: "Post fetched successfully",
      post
    });

  } catch (error) {
    console.error(
      "GET POST BY ID ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch post",
      error: error.message
    });
  }
};


// =========================
// UPDATE POST
// =========================
const updatePost = async (req, res) => {
  try {
    const {
      title,
      caption,
      hashtags,
      contentType,
      mediaUrl,
      status,
      scheduledDate
    } = req.body;

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id
      },
      {
        title,
        caption,
        hashtags,
        contentType,
        mediaUrl,
        status,
        scheduledDate
      },
      {
        new: true,
        runValidators: true
      }
    ).populate(
      "client",
      "name email companyName userId"
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      post
    });

  } catch (error) {
    console.error(
      "UPDATE POST ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update post",
      error: error.message
    });
  }
};


// =========================
// DELETE POST
// =========================
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    return res.status(200).json({
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error(
      "DELETE POST ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete post",
      error: error.message
    });
  }
};


// =========================
// EXPORT
// =========================
module.exports = {
  createPost,
  getPosts,
  getClientPosts,
  getPostById,
  updatePost,
  deletePost
};