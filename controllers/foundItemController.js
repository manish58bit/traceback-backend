const PostOfFound = require("../models/postOfFound.js");
const Item = require("../models/item.js");
const User = require("../models/user.js");
const allPost_foundItems = async (req, res) => {
  try {
    const posts = await PostOfFound.find()
      .populate("item")
      .populate("user", "name email");
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
const allPost_foundItems_byUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) token = authHeader.split(" ", 2)[1] || "";
    else token = authHeader;
    token = (token || "").trim();
    if (!token)
      return res.status(401).json({ message: "Unauthorized: missing token" });

    const jwt = require("jsonwebtoken");
    const secret = process.env.jwt_key;
    if (!secret)
      return res.status(500).json({ message: "Server configuration error" });
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err && err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      return res.status(401).json({ message: "Invalid token" });
    }

    const posts = await PostOfFound.find({ user: decoded.id })
      .populate("item")
      .populate("user", "name email avatar");
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const post_foundItem = async (req, res) => {
  try {
    const itemData = { ...(req.body.item || {}) };
    if (itemData.image && !itemData.imageUrl)
      itemData.imageUrl = itemData.image;
    const item = new Item(itemData);

    // determine user id from token or body
    let userId = null;
    try {
      const authHeader = req.headers.authorization || "";
      let token = "";
      if (authHeader.includes(" ")) token = authHeader.split(" ", 2)[1] || "";
      else token = authHeader;
      token = (token || "").trim();
      if (token) {
        const jwt = require("jsonwebtoken");
        const secret = process.env.jwt_key;
        if (secret) {
          try {
            const decoded = jwt.verify(token, secret);
            userId = decoded.id;
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {}

    if (!userId) {
      if (req.body.user && req.body.user._id) {
        userId = req.body.user._id;
      } else if (req.body.user && req.body.user.email) {
        const existing = await User.findOne({ email: req.body.user.email });
        if (existing) userId = existing._id;
        else {
          const crypto = require("crypto");
          const randomPass = crypto.randomBytes(16).toString("hex");
          const newUser = new User({
            ...(req.body.user || {}),
            password: randomPass,
          });
          await newUser.save();
          userId = newUser._id;
        }
      } else {
        const crypto = require("crypto");
        const randomPass = crypto.randomBytes(16).toString("hex");
        const newUser = new User({ name: "Anonymous", password: randomPass });
        await newUser.save();
        userId = newUser._id;
      }
    }

    const postOfFound = new PostOfFound(req.body || {});
    postOfFound.item = item._id;
    postOfFound.user = userId;

    // Ensure required dateFound is set (use provided value or now)
    if (!postOfFound.dateFound)
      postOfFound.dateFound = req.body.dateFound
        ? new Date(req.body.dateFound)
        : new Date();

    await item.save();
    await postOfFound.save();

    const populated = await PostOfFound.findById(postOfFound._id)
      .populate("item")
      .populate("user", "name email avatar");
    res
      .status(200)
      .json({ message: "Found Item reported successfully", post: populated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const update_foundItem_byId = async (req, res) => {
  try {
    const id = req.params.id;
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) token = authHeader.split(" ", 2)[1] || "";
    else token = authHeader;
    token = (token || "").trim();
    if (!token)
      return res.status(401).json({ message: "Unauthorized: missing token" });
    const jwt = require("jsonwebtoken");
    const secret = process.env.jwt_key;
    if (!secret)
      return res.status(500).json({ message: "Server configuration error" });
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err && err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      return res.status(401).json({ message: "Invalid token" });
    }

    const post = await PostOfFound.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== decoded.id)
      return res.status(403).json({ message: "Forbidden" });

    const { status, contactInfo } = req.body || {};
    if (status) post.status = status;
    if (typeof contactInfo !== "undefined") post.contactInfo = contactInfo;
    await post.save();
    const refreshed = await PostOfFound.findById(id)
      .populate("item")
      .populate("user", "name email avatar");
    res.status(200).json(refreshed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const delete_foundItem_byId = async (req, res) => {
  try {
    const id = req.params.id;
    const authHeader = req.headers.authorization || "";
    let token = "";
    if (authHeader.includes(" ")) token = authHeader.split(" ", 2)[1] || "";
    else token = authHeader;
    token = (token || "").trim();
    if (!token)
      return res.status(401).json({ message: "Unauthorized: missing token" });
    const jwt = require("jsonwebtoken");
    const secret = process.env.jwt_key;
    if (!secret)
      return res.status(500).json({ message: "Server configuration error" });
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err && err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      return res.status(401).json({ message: "Invalid token" });
    }

    const post = await PostOfFound.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== decoded.id)
      return res.status(403).json({ message: "Forbidden" });

    await PostOfFound.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
  allPost_foundItems,
  post_foundItem,
  allPost_foundItems_byUser,
  update_foundItem_byId,
  delete_foundItem_byId,
};
