const express = require("express");

const {
  createPost,
  getPosts,
  getClientPosts,
  getPostById,
  updatePost,
  deletePost
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// CREATE POST - AGENCY ONLY
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  createPost
);

// =====================================================
// GET ALL POSTS - AGENCY ONLY
// =====================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  getPosts
);

// =====================================================
// GET POSTS FOR LOGGED-IN CLIENT
// =====================================================

router.get(
  "/client",
  authMiddleware,
  roleMiddleware("client"),
  getClientPosts
);

// =====================================================
// GET SINGLE POST - AGENCY ONLY
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  getPostById
);

// =====================================================
// UPDATE POST - AGENCY ONLY
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  updatePost
);

// =====================================================
// DELETE POST - AGENCY ONLY
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  deletePost
);

module.exports = router;