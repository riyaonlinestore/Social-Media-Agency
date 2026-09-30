const express = require("express");

const {
  addComment,
  getCommentsByPost
} = require("../controllers/commentcontrollers");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add comment
router.post(
  "/",
  authMiddleware,
  addComment
);

// Get comments for a post
router.get(
  "/:postId",
  authMiddleware,
  getCommentsByPost
);

module.exports = router;