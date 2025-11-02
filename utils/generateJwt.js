const jwt = require("jsonwebtoken");
const generateJwt = (newUser) => {
  const secret_key = process.env.jwt_key;
  // default expiry: 7 days to avoid immediate invalidation. If you want a different
  // expiry, set process.env.JWT_EXPIRES (e.g. '1d', '7d', '12h')
  const expires = process.env.JWT_EXPIRES || "7d";
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, secret_key, {
    expiresIn: expires,
  });
  return token;
};
module.exports = generateJwt;
