const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/user");

const ADMIN_EMAIL = "admin@nitw.ac.in";
const ADMIN_PASSWORD = "Admin@123"; // Change this to a secure password
const ADMIN_NAME = "Admin User";

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.mongo_uri);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      console.log("Admin user already exists!");
      console.log(`Email: ${admin.email}`);
      console.log(`Name: ${admin.name}`);
      console.log(`isAdmin: ${admin.isAdmin}`);

      // Update to ensure isAdmin is true
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
        console.log("Updated isAdmin to true");
      }
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        phone: "9999999999",
        isAdmin: true,
      });

      await admin.save();
      console.log("✅ Admin user created successfully!");
      console.log(`\nAdmin Credentials:`);
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      console.log(`\n⚠️  IMPORTANT: Change this password after first login!`);
    }

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error setting up admin:", error.message);
    process.exit(1);
  }
}

setupAdmin();
