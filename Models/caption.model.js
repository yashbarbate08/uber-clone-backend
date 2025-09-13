const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captionSchema = new mongoose.Schema({
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
    validate: {
      validator: (v) => {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
      },
      message: "Invalid email address",
    },
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
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  vehicle: {
    color: {
      type: String,
      required: true,
    },
    plate: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    vehicleType: {
      type: String,
      enum: ["car", "auto", "bike"],
      required: true,
    },
  },
  location: {
    ltd: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
});

// Hash password before saving
captionSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Generate JWT Token
captionSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Compare entered password with hashed password
captionSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash password utility
captionSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

module.exports = mongoose.model("caption", captionSchema);
