const PostOfLost = require("../../models/postOfLost.js");
const PostOfFound = require("../../models/postOfFound.js");
const jwt = require("jsonwebtoken");

const deletePost = async (req, res) => {
  const { postId, postType } = req.body;

  try {
    // Verify admin token
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) token = authHeader.split(" ", 2)[1] || "";
    else token = authHeader;
    token = (token || "").trim();

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const secret = process.env.jwt_key;
    if (!secret) {
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

    // Find user and check if admin
    const User = require("../../models/user.js");
    const user = await User.findById(decoded.id);
    if (!user || !user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    if (!postId || !postType) {
      return res
        .status(400)
        .json({ message: "postId and postType are required" });
    }

    // Determine post model based on type
    const PostModel = postType === "lost" ? PostOfLost : PostOfFound;

    // Find and delete post
    const post = await PostModel.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: `${postType} item post deleted successfully`,
      deletedPost: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error: Failed to delete post" });
  }
};

module.exports = deletePost;
