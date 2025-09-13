const User = require("../Models/user.model"); // ✅ Use uppercase convention
const BlacklistToken = require("../Models/blacklistToken.model");

const cookieParser = require("cookie-parser");

// Register
module.exports.register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check required fields
    if (!fullname || !fullname.firstname || !email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Create new user
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = newUser.generateAuthToken();

    await newUser.save();

    res
      .status(201)
      .json({ token, user: newUser, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    // Find user by email
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = existingUser.generateAuthToken();
    res.cookie("token", token);

    res
      .status(200)
      .json({ token, user: existingUser, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  res
    .status(200)
    .json(req.user, { message: "User profile fetched successfully" });
};

// Logout
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    await BlacklistToken.create({ token });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
