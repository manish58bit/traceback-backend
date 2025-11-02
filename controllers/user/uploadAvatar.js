const jwt = require("jsonwebtoken");
const User = require("../../models/user.js");

// Accept a JSON body { avatar: string } where avatar is a remote URL (Cloudinary)
const uploadAvatar = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) {
      token = authHeader.split(" ", 2)[1] || "";
    } else {
      token = authHeader;
    }
    token = (token || "").trim();
    if (!token)
      return res.status(401).json({ message: "Unauthorized: missing token" });

    const secret = process.env.jwt_key;
    if (!secret) {
      console.error("JWT secret is not set (process.env.jwt_key)");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err && err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      return res.status(401).json({ message: "Invalid token" });
    }

    const { avatar } = req.body || {};
    if (!avatar || typeof avatar !== "string") {
      return res.status(400).json({ message: "Missing avatar URL" });
    }

    // basic validation: ensure it's an http(s) URL
    if (!/^https?:\/\//i.test(avatar)) {
      return res.status(400).json({ message: "Invalid avatar URL" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.avatar = avatar;
    await user.save();

    res.status(200).json({ avatar: user.avatar, message: "Avatar saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = uploadAvatar;
