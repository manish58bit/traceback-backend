const mongoose = require("mongoose");
const postFoundSchema = new mongoose.Schema({
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
  dateFound: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Matched", "Returned", "Claimed", "Unclaimed", "Closed"],
    default: "Unclaimed",
  },
  contactInfo: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model already exists before compiling
const PostOfFound =
  mongoose.models.PostFound || mongoose.model("PostFound", postFoundSchema);
module.exports = PostOfFound;
