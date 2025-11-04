const express = require("express");
const userSignup = require("../controllers/user/userSignup.js");
const userLogin = require("../controllers/user/userLogin.js");
const adminLogin = require("../controllers/user/adminLogin.js");
const getProfile = require("../controllers/user/getProfile.js");
const updateProfile = require("../controllers/user/updateProfile.js");
const forgotPassword = require("../controllers/user/forgotPassword.js");
const resetPassword = require("../controllers/user/resetPassword.js");
const uploadAvatar = require("../controllers/user/uploadAvatar.js");
const deletePost = require("../controllers/admin/deletePost.js");
const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
router.route("/admin-login").post(adminLogin);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

router.route("/profile").get(getProfile).put(updateProfile);
router.route("/profile/avatar").post(uploadAvatar);

// Admin routes
router.route("/admin/delete-post").post(deletePost);

module.exports = router;
