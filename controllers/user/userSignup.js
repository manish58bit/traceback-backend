const User = require("../../models/user.js");
const mongoose = require("mongoose");
const generateJwt = require("../../utils/generateJwt.js");

const userSignup = async (req, res) => {
  const person = req.body;
  try {
    const existingUser = await User.findOne({ email: person.email.trim() });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }
    const newuser = new User({ ...person });
    await newuser.save();
    const token = generateJwt(newuser);
    res
      .status(201)
      .json({ message: "New user Registered Successsfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error: Signup failed" });
  }
};
module.exports = userSignup;
