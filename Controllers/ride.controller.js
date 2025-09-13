const { validationResult } = require("express-validator");
const rideService = require("../services/ride.service");
const mapsService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../Models/ride.model");

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, pickup, destination, vehicleType } = req.body;
  try {
    // const userId = req.user._id; // authMiddleware मधून आलेलं user id

    // DB मध्ये ride create करा
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const pickupcoordinates = await mapsService.getAddressCoordinate(pickup);
    // console.log(pickupcoordinates);

    const captionsInRadius = await mapsService.getCaptionsInTheRadius(
      pickupcoordinates.ltd,
      pickupcoordinates.lng,
      10
    ); // 10 km radius
    // console.log("Captions in Radius:", captionsInRadius);

    ride.otp = "";

    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    captionsInRadius.map(async (caption) => {
      sendMessageToSocketId(caption.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });

    // console.log(rideWithUser);

    return res.status(201).json({
      success: true,
      message: "Ride created successfully",
      ride,
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query; // since you're using GET

  try {
    if (!pickup || !destination) {
      return res
        .status(400)
        .json({ error: "Pickup and destination are required" });
    }

    // ✅ pass separately, not as object
    const fare = await rideService.getFare(pickup, destination);

    return res.status(200).json({
      success: true,
      message: "Fare calculated successfully",
      fare,
    });
  } catch (error) {
    console.error("Error calculating fare:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      caption: req.caption,
    });

    console.log("confirmRide called by caption:", req.caption?._id);

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      caption: req.caption,
    });

    console.log(ride);

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, caption: req.caption });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
