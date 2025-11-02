const jwt = require("jsonwebtoken");
const User = require("../../models/user.js");

const updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) {
      token = authHeader.split(" ", 2)[1] || "";
    } else {
      token = authHeader;
    }

    token = (token || "").trim();
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const secret = process.env.jwt_key;
    if (!secret) {
      console.error("JWT secret is not set (process.env.jwt_key)");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err && err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    const { name, phone, password } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (typeof phone !== "undefined") user.phone = phone;
    if (password && password.length > 0) user.password = password; // will be hashed by pre-save hook

    await user.save();

    res
      .status(200)
      .json({
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        message: "Profile updated",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = updateProfile;
