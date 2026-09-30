const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// MODELS
// =========================
const User = require("./models/User");

// =========================
// ROUTES
// =========================
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const clientRoutes = require("./routes/clientRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const commentRoutes = require("./routes/Commentroutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// =========================
// ROUTE CONNECTIONS
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);

// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "Social Media Agency API is running!"
  });
});

// =========================
// MONGODB CONNECTION
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully!");

    // =========================
    // TEMPORARY DATABASE CHECK
    // =========================
    console.log("DATABASE NAME:", mongoose.connection.name);
    console.log("DATABASE HOST:", mongoose.connection.host);

    const userCount = await User.countDocuments();

    console.log("TOTAL USERS IN SERVER DATABASE:", userCount);

    const testUser = await User.findOne({
      email: "pshivangi2006@gmail.com"
    });

    console.log(
      "PSHIVANGI USER FOUND IN SERVER DATABASE:",
      testUser ? "YES" : "NO"
    );

    if (testUser) {
      console.log("USER EMAIL:", testUser.email);
      console.log("USER ROLE:", testUser.role);
    }
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});