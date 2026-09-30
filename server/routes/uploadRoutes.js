const express = require("express");

const {
  upload,
  uploadImage,
} = require("../controllers/uploadController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/image",
  authMiddleware,
  roleMiddleware("agency"),
  upload.single("image"),
  uploadImage
);

module.exports = router;