const User = require("../../models/user.js");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  try {
    // Validate inputs
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify OTP
    if (!user.resetOTP || user.resetOTP !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    return res.status(200).json({
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server Error: Failed to reset password" });
  }
};

module.exports = resetPassword;
