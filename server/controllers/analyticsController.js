const Analytics = require("../models/Analytics");

// =========================
// ADD ANALYTICS
// =========================
const addAnalytics = async (req, res) => {
  try {
    const {
      client,
      followers,
      likes,
      comments,
      reach,
      engagement
    } = req.body;

    if (!client) {
      return res.status(400).json({
        message: "Client is required"
      });
    }

    const analytics = await Analytics.create({
      client,
      followers,
      likes,
      comments,
      reach,
      engagement
    });

    return res.status(201).json({
      message: "Analytics added successfully",
      analytics
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to add analytics",
      error: error.message
    });
  }
};


// =========================
// GET ANALYTICS BY CLIENT
// =========================
const getAnalyticsByClient = async (req, res) => {
  try {
    const analytics = await Analytics.find({
      client: req.params.clientId
    })
      .populate("client", "name companyName")
      .sort({ date: -1 });

    return res.status(200).json({
      message: "Analytics fetched successfully",
      analytics
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};


module.exports = {
  addAnalytics,
  getAnalyticsByClient
};