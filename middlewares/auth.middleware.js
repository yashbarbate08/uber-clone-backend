const User = require("../Models/user.model");
const captionModel = require("../Models/caption.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const BlacklistToken = require("../Models/blacklistToken.model");

module.exports.authUser = async (req, res, next) => {
  // const token =  req.coo req.headers.authorization?.split(" ")[1];
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Check cookies first, then headers
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isblacklisted = await BlacklistToken.findOne({ token });
  if (isblacklisted) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = await User.findById(decoded._id); // use User model

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = existingUser; // Attach user to request
    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports.authCaption = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // Check cookies first, then headers
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isblacklisted = await BlacklistToken.findOne({ token });
  if (isblacklisted) {
    return res.status(401).json({ message: "Token is blacklisted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const existingCaption = await captionModel.findById(decoded._id); // use caption model

    if (!existingCaption) {
      return res.status(401).json({ message: "Caption not found" });
    }

    req.caption = existingCaption; // Attach caption to request
    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};