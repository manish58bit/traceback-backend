require("dotenv").config();
// Ensure a Mongo URI is provided (supports either mongo_uri or MONGO_URI keys)
if (!process.env.mongo_uri && !process.env.MONGO_URI) {
  console.error(
    "Missing MongoDB connection string. Set environment variable `mongo_uri` or `MONGO_URI` before running this script."
  );
  console.error(
    "Example (PowerShell): $env:mongo_uri='mongodb://localhost:27017/traceback'; node ./scripts/seedPosts.js"
  );
  console.error(
    "Example (bash): mongo_uri='mongodb://localhost:27017/traceback' node ./scripts/seedPosts.js"
  );
  process.exit(1);
}
const mongoose = require("mongoose");
const conectDB = require("../config/db");

const PostOfLost = require("../models/postOfLost");
const PostOfFound = require("../models/postOfFound");
const Item = require("../models/item");
const User = require("../models/user");

const IMAGE_URL =
  "https://res.cloudinary.com/dboe0czo8/image/upload/v1761299863/realme12pro_zzxlo3.jpg";

const statuses = ["Matched", "Returned", "Claimed", "Unclaimed", "Closed"];
const categories = [
  "Electronics",
  "Documents",
  "Accessories",
  "Clothing",
  "Others",
];

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function randomDateWithinDays(days) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(past);
}

function sample(arr) {
  return arr[randInt(arr.length)];
}

async function seed() {
  try {
    await conectDB();

    // Create a few users
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const email = `seeduser${i}@example.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: `Seed User ${i}`,
          email,
          password: "Password123!",
        });
      }
      users.push(user);
    }

    const createdLost = [];
    const createdFound = [];

    // Insert 20 lost posts
    for (let i = 0; i < 20; i++) {
      const item = await Item.create({
        name: `Lost Item ${i + 1}`,
        category: sample(categories),
        description: `Auto-generated lost item ${i + 1} - ${Math.random()
          .toString(36)
          .slice(2, 10)}`,
        imageUrl: IMAGE_URL,
        location: `Location ${randInt(20) + 1}`,
      });

      const post = await PostOfLost.create({
        user: sample(users)._id,
        item: item._id,
        dateLost: randomDateWithinDays(60),
        status: sample(statuses),
        additionalInfo: `Auto-created lost post ${i + 1}`,
        createdAt: new Date(),
      });

      createdLost.push(post);
    }

    // Insert 20 found posts
    for (let i = 0; i < 20; i++) {
      const item = await Item.create({
        name: `Found Item ${i + 1}`,
        category: sample(categories),
        description: `Auto-generated found item ${i + 1} - ${Math.random()
          .toString(36)
          .slice(2, 10)}`,
        imageUrl: IMAGE_URL,
        location: `Location ${randInt(20) + 1}`,
      });

      const post = await PostOfFound.create({
        user: sample(users)._id,
        item: item._id,
        dateFound: randomDateWithinDays(60),
        status: sample(statuses),
        contactInfo: `contact+${Math.random()
          .toString(36)
          .slice(2, 6)}@example.com`,
        createdAt: new Date(),
      });

      createdFound.push(post);
    }

    console.log(
      `Inserted ${createdLost.length} lost posts and ${createdFound.length} found posts.`
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
