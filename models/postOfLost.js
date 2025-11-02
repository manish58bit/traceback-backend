const mongoose = require("mongoose");
const postLostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  dateLost: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Matched", "Returned", "Claimed", "Unclaimed", "Closed"],
    default: "Unclaimed",
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model already exists before compiling
const PostOfLost =
  mongoose.models.postLost || mongoose.model("postLost", postLostSchema);
module.exports = PostOfLost;
