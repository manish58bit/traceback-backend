// all-in-one.js
const mongoose = require("mongoose");

// 1️⃣ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 2️⃣ Define the Item schema and model

const Item = require("../models/item.js");
const PostOfLost = require("../models/postOfLost.js");
const saveSampleData = async () => {
  const item = new Item({
    name: "Realme 12 pro",
    category: "Electronics",
    description: "This is sample item data",
    imageurl: "sampleimageurl",
    location: "ts",
  });

  const postOfLost = new PostOfLost({
    user: "68f0d242e849c913d3a84768",
    item: "68f1182132f43e24dec40aa3",
    dateLost: "2025-10-16",
    status: "Lost",
    additionalinfo: "Lorem Ipsum",
  });

  try {
    const savedItem = await item.save();
    console.log("Item saved successfully:", savedItem);
    const savedPostOfLost = await postOfLost.save();
    console.log("PostOfLost saved successfully:", savedPostOfLost);
  } catch (err) {
    console.error("Error saving item:", err);
  } finally {
    mongoose.connection.close(); // close connection after saving
  }
};

// 4️⃣ Wait for connection, then save item
mongoose.connection.once("open", () => {
  saveSampleData();
});
