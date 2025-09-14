const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();

const rideController = require("../Controllers/ride.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/create",
  authMiddleware.authUser,

  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid pickup location"),

  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid destination location"),

  body("vehicleType")
    .isIn(["auto", "car", "moto"])
    .withMessage("Invalid vehicle type"),

  rideController.createRide
);

router.get(
  "/get-fare",
  authMiddleware.authUser,

  query("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid pickup location"),

  query("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid destination location"),

  rideController.getFare
);

router.post(
  "/confirm",
  authMiddleware.authCaption,
  body("rideId").isMongoId().withMessage("Invalid ride id"),
  rideController.confirmRide
);

router.get(
  "/start-ride",
  authMiddleware.authCaption,
  query("rideId").isMongoId().withMessage("Invalid ride id"),
  query("otp")
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid OTP"),
  rideController.startRide
);

router.post(
  "/end-ride",
  authMiddleware.authCaption,
  body("rideId").isMongoId().withMessage("Invalid ride id"),
  rideController.endRide
);
module.exports = router;
