const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    caption: {
      type: String,
      trim: true
    },

    hashtags: {
      type: String,
      trim: true
    },

    contentType: {
      type: String,
      enum: ["image", "reel", "text"],
      default: "image"
    },

    mediaUrl: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "scheduled"
      ],
      default: "draft"
    },

    scheduledDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;