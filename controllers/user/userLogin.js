const User = require("../../models/user.js");
const generateJwt = require("../../utils/generateJwt.js");
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      res.status(400).json({
        message: "Email does not exists",
      });
      return;
    }
    const is_correct_password = await user.matchPassword(password);
    if (!is_correct_password) {
      res.status(400).json({
        message: "Wrong password",
      });
      return;
    }
    const token = generateJwt(user);
    res
      .status(200)
      .json({ name: user.name, email: user.email, phone: user.phone, token });
  } catch (error) {
    console.log(error);
  }
};
module.exports = userLogin;
