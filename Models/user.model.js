const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validator = require("validator");

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "First name must have at least 3 characters"],
    },
    lastname: {
      type: String,
      minlength: [3, "Last name must have at least 3 characters"],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  socketId: {
    type: String,
  },
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h", // optional expiry
  });
};

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash password before saving
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const user = mongoose.model("user", userSchema);

module.exports = user;
