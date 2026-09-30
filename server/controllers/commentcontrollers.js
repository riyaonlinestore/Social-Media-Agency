const Comment = require("../models/Comment");

// =========================
// ADD COMMENT
// =========================
const addComment = async (req, res) => {
  try {
    const { post, client, comment } = req.body;

    if (!post || !client || !comment) {
      return res.status(400).json({
        message: "Post, client and comment are required",
      });
    }

    const newComment = await Comment.create({
      post,
      client,
      comment,
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// =========================
// GET COMMENTS BY POST
// =========================
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

module.exports = {
  addComment,
  getCommentsByPost,
};