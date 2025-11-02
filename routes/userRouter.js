const express = require("express");
const userSignup = require("../controllers/user/userSignup.js");
const userLogin = require("../controllers/user/userLogin.js");
const getProfile = require("../controllers/user/getProfile.js");
const updateProfile = require("../controllers/user/updateProfile.js");
const router = express.Router();

router.route("/signup").post(userSignup);
router.route("/login").post(userLogin);
const uploadAvatar = require("../controllers/user/uploadAvatar.js");

router.route("/profile").get(getProfile).put(updateProfile);
router.route("/profile/avatar").post(uploadAvatar);

module.exports = router;
