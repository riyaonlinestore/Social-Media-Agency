const express = require("express");

const {
  createApproval,
  getApprovals,
  getClientApprovals,
  approvePost,
  rejectPost,
  addFeedback
} = require("../controllers/approvalController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// CREATE APPROVAL REQUEST - AGENCY ONLY
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  createApproval
);

// =====================================================
// GET ALL APPROVALS - AGENCY ONLY
// =====================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  getApprovals
);

// =====================================================
// GET APPROVALS FOR LOGGED-IN CLIENT
// =====================================================

router.get(
  "/client",
  authMiddleware,
  roleMiddleware("client"),
  getClientApprovals
);

// =====================================================
// APPROVE POST - CLIENT ONLY
// =====================================================

router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("client"),
  approvePost
);

// =====================================================
// REJECT POST - CLIENT ONLY
// =====================================================

router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("client"),
  rejectPost
);

// =====================================================
// ADD FEEDBACK - CLIENT ONLY
// =====================================================

router.put(
  "/:id/feedback",
  authMiddleware,
  roleMiddleware("client"),
  addFeedback
);

module.exports = router;