const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },

    followers: {
      type: Number,
      default: 0
    },

    likes: {
      type: Number,
      default: 0
    },

    comments: {
      type: Number,
      default: 0
    },

    reach: {
      type: Number,
      default: 0
    },

    engagement: {
      type: Number,
      default: 0
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;