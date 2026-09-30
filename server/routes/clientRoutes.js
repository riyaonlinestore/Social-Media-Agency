const express = require("express");

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient
} = require("../controllers/clientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// CREATE CLIENT - AGENCY ONLY
// =========================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  createClient
);

// =========================
// GET ALL CLIENTS - AGENCY ONLY
// =========================
router.get(
  "/",
  authMiddleware,
  roleMiddleware("agency"),
  getClients
);

// =========================
// GET SINGLE CLIENT - AGENCY ONLY
// =========================
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  getClientById
);

// =========================
// UPDATE CLIENT - AGENCY ONLY
// =========================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  updateClient
);

// =========================
// DELETE CLIENT - AGENCY ONLY
// =========================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("agency"),
  deleteClient
);

module.exports = router;