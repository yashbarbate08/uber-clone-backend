const express = require("express");
const { body, validationResult } = require("express-validator");
const caption = require("../Models/caption.model");
const router = express.Router();
const captionController = require("../Controllers/caption.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Create a new caption
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "bike", "truck"])
      .withMessage("Invalid vehicle type"),
  ],
  captionController.registerCaption
);

// Login caption
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must have 6 charector"),
  ],
  captionController.loginCaption
);

// Logout caption
router.post(
  "/logout",
  authMiddleware.authCaption,
  captionController.logoutCaption
);

// Get caption profile
router.get(
  "/profile",
  authMiddleware.authCaption,
  captionController.getCaptionProfile
);
module.exports = router;
