const express = require("express");

const { getDashboardStats } = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("agency"),
  getDashboardStats
);

module.exports = router;