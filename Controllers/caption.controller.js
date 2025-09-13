const Caption = require("../Models/caption.model"); 
const cookieParser = require("cookie-parser");
const BlacklistToken = require("../Models/blacklistToken.model");

const { validationResult } = require("express-validator");

module.exports.registerCaption = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptionExists = await Caption.findOne({ email });
    if (isCaptionExists) {
      return res.status(400).json({ message: "Caption already exists" });
    }

    // ✅ No need to hash here, pre-save hook will handle it
    const newCaption = new Caption({
      fullname,
      email,
      password,  // store plain password, pre-save will hash
      vehicle: {
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType,
      },
    });

    // Save to DB
    await newCaption.save();

    // Generate token
    const token = newCaption.generateAuthToken();

    res.status(201).json({
      token,
      caption: newCaption,
      message: "Caption registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login Caption
module.exports.loginCaption = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    // Find caption by email
    const existingCaption = await Caption.findOne({ email }).select("+password");

    if (!existingCaption) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await existingCaption.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = existingCaption.generateAuthToken();
    res.cookie("token", token);

    res.status(200).json({
      token,
      caption: existingCaption,
      message: "Caption logged in successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get caption profile
module.exports.getCaptionProfile = async (req, res) => {
  res
    .status(200)
    .json(req.caption, { message: "Caption profile fetched successfully" });
};

// Logout caption
module.exports.logoutCaption = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Add token to blacklist
    await BlacklistToken.create({ token });

    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
