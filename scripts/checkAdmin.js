const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/user");

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.mongo_uri);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "admin@nitw.ac.in" });

    if (admin) {
      console.log("\n✅ Admin user found!");
      console.log("Name:", admin.name);
      console.log("Email:", admin.email);
      console.log("isAdmin:", admin.isAdmin);
      console.log("Password hash:", admin.password.substring(0, 20) + "...");

      // Test password match
      const isMatch = await admin.matchPassword("Admin@123");
      console.log("Password 'Admin@123' matches:", isMatch);
    } else {
      console.log("\n❌ Admin user NOT found in database!");
      console.log("\nAll users in database:");
      const allUsers = await User.find({}, "name email isAdmin");
      console.log(allUsers);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAdmin();
