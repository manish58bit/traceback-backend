const mongoose = require("mongoose");
const itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["Electronics", "Documents", "Accessories", "Clothing", "Others"],
    default: "Others",
  },
  description: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    required: true,
  },
});

// Check if model already exists before compiling
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
module.exports = Item;
