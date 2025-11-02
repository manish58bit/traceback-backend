const PostOfLost = require("../models/postOfLost.js");
const Item = require("../models/item.js");
const User = require("../models/user.js");
const allPost_lostItems = async (req, res) => {
  try {
    const posts = await PostOfLost.find()
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
const allPost_lostItems_byUser = async (req, res) => {
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

    const posts = await PostOfLost.find({ user: decoded.id })
      .populate("item")
      .populate("user", "name email avatar");
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const post_lostItem = async (req, res) => {
  try {
    // create item document - normalize image field -> imageUrl
    const itemData = { ...(req.body.item || {}) };
    if (itemData.image && !itemData.imageUrl)
      itemData.imageUrl = itemData.image;
    const item = new Item(itemData);

    // determine user id: prefer auth token, then req.body.user._id, then find-by-email, else create minimal user
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
            // ignore token errors and fallback to body
          }
        }
      }
    } catch (e) {
      // ignore
    }

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
        // create an anonymous user with random password to satisfy schema
        const crypto = require("crypto");
        const randomPass = crypto.randomBytes(16).toString("hex");
        const newUser = new User({ name: "Anonymous", password: randomPass });
        await newUser.save();
        userId = newUser._id;
      }
    }

    const postOfLost = new PostOfLost(req.body || {});
    postOfLost.item = item._id;
    postOfLost.user = userId;

    // Ensure required dateLost is set (use provided value or now)
    if (!postOfLost.dateLost)
      postOfLost.dateLost = req.body.dateLost
        ? new Date(req.body.dateLost)
        : new Date();

    await item.save();
    await postOfLost.save();

    // return populated post so client has item data (including imageUrl)
    const populated = await PostOfLost.findById(postOfLost._id)
      .populate("item")
      .populate("user", "name email avatar");
    res
      .status(200)
      .json({ message: "Lost Item reported successfully", post: populated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
const update_lostItem_byId = async (req, res) => {
  try {
    const id = req.params.id;
    // auth
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

    const post = await PostOfLost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== decoded.id)
      return res.status(403).json({ message: "Forbidden" });

    const { status, additionalInfo } = req.body || {};
    if (status) post.status = status;
    if (typeof additionalInfo !== "undefined")
      post.additionalInfo = additionalInfo;
    await post.save();
    const refreshed = await PostOfLost.findById(id)
      .populate("item")
      .populate("user", "name email avatar");
    res.status(200).json(refreshed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const delete_lostItem_byId = async (req, res) => {
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

    const post = await PostOfLost.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== decoded.id)
      return res.status(403).json({ message: "Forbidden" });

    await PostOfLost.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
  allPost_lostItems,
  post_lostItem,
  allPost_lostItems_byUser,
  update_lostItem_byId,
  delete_lostItem_byId,
};
