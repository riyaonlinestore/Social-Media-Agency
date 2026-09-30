const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// =========================
// REGISTER USER
// =========================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "client"
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};


// =========================
// LOGIN USER
// =========================
const loginUser = async (req, res) => {
  console.log("========== LOGIN API HIT ==========");

  try {
    const { email, password } = req.body;

    console.log("LOGIN EMAIL:", email);
    console.log("PASSWORD RECEIVED:", password ? "YES" : "NO");

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    console.log("USER FOUND:", user ? "YES" : "NO");

    // User not found
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    console.log("USER EMAIL FROM DB:", user.email);
    console.log("USER ROLE:", user.role);

    // Check password
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH:", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    console.log("LOGIN SUCCESS");

    // Send response
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};


// =========================
// GET PROFILE
// =========================
const getProfile = async (req, res) => {
  try {
    // Find logged-in user
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user: user
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to get profile",
      error: error.message
    });
  }
};


// =========================
// EXPORT CONTROLLERS
// =========================
module.exports = {
  registerUser,
  loginUser,
  getProfile
};