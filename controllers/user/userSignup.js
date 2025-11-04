const User = require("../../models/user.js");
const mongoose = require("mongoose");
const generateJwt = require("../../utils/generateJwt.js");

const userSignup = async (req, res) => {
  const person = req.body;
  try {
    // Validate email format - must be .nitw.ac.in or .student.nitw.ac.in college email
    const email = person.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const isValidNITWEmail =
      email.endsWith("@nitw.ac.in") || email.endsWith("@student.nitw.ac.in");

    if (!isValidNITWEmail) {
      return res.status(400).json({
        message:
          "Please signup with your college email (nitw.ac.in or student.nitw.ac.in)",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }
    const newuser = new User({ ...person, email });
    await newuser.save();
    const token = generateJwt(newuser);
    res
      .status(201)
      .json({ message: "New user Registered Successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error: Signup failed" });
  }
};
module.exports = userSignup;
