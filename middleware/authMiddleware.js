const jwt = require("jsonwebtoken");

require("dotenv").config();
var secret_key = process.env.SECRET_KEY;

// Middleware to verify JWT
module.exports = function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    console.log("middleware.js : dddddd");
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token.split(" ")[1], secret_key, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }
    req.user = decoded; // Store decoded user information for further use
    next();
  });
};
