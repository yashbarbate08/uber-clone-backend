const express = require("express");
const { body, validationResult } = require("express-validator");
const userController = require("../Controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const user = require("../Models/user.model");

const router = express.Router();

// Register route
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
  ],
  (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Send only first error per field
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));
      return res.status(400).json({ errors: formattedErrors });
    }
    next();
  },
  userController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must have 6 charector"),
  ],
  userController.loginUser
);

router.get("/profile",authMiddleware.authUser, userController.getUserProfile);

router.get("/logout", authMiddleware.authUser, userController.logoutUser);

module.exports = router;
