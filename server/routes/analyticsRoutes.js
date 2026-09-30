const express = require("express");

const {
  addAnalytics,
  getAnalyticsByClient
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Add analytics
router.post(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  addAnalytics
);

// Get analytics for a client
router.get(
  "/client/:clientId",
  authMiddleware,
  roleMiddleware("agency"),
  getAnalyticsByClient
);

module.exports = router;