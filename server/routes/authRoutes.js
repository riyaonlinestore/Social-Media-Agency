const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// REGISTER
// =========================
router.post("/register", registerUser);

// =========================
// LOGIN
// =========================
router.post("/login", loginUser);

// =========================
// PROFILE - AGENCY ONLY
// =========================
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("agency"),
  getProfile
);

module.exports = router;