const rideModel = require("../Models/ride.model");
const mapsService = require("../services/maps.service");
const crypto = require("crypto");
const { sendMessageToSocketId } = require("../socket");

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapsService.getDistanceTime(pickup, destination);

  const baseFare = { auto: 30, car: 50, moto: 20 };
  const perKmRate = { auto: 10, car: 15, moto: 8 };
  const perMinuteRate = { auto: 2, car: 3, moto: 1.5 };

  const fare = {
    auto: +(
      baseFare.auto +
      (distanceTime.distance.value / 1000) * perKmRate.auto +
      (distanceTime.duration.value / 60) * perMinuteRate.auto
    ).toFixed(2),
    car: +(
      baseFare.car +
      (distanceTime.distance.value / 1000) * perKmRate.car +
      (distanceTime.duration.value / 60) * perMinuteRate.car
    ).toFixed(2),
    moto: +(
      baseFare.moto +
      (distanceTime.distance.value / 1000) * perKmRate.moto +
      (distanceTime.duration.value / 60) * perMinuteRate.moto
    ).toFixed(2),
  };

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("User, pickup, destination and vehicleType are required");
  }

  const fare = await getFare(pickup, destination);

  const ride = await rideModel.create({
    user, // <-- pass user ObjectId here
    pickup,
    destination,
    otp: getOtp(6),
    fare: fare[vehicleType], // only selected vehicle fare
  });

  return ride;
};

module.exports.confirmRide = async ({ rideId, caption }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "accepted",
      caption: caption._id,
    }
  );

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("caption")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
};

module.exports.startRide = async ({ rideId, otp, caption }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and otp are required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("caption")
    .select("+otp");

  if (!ride) {
    throw new Error("Invalid ride id or otp");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride is not accepted yet");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "ongoing",
    }
  );

  sendMessageToSocketId(ride.user.socketId, {
    event: "ride-started",
    data: ride,
  });

  return ride;
};

module.exports.endRide = async ({ rideId, caption }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({ _id: rideId, caption: caption._id })
    .populate("user")
    .populate("caption")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  await rideModel.findOneAndUpdate(
    { _id: rideId },
    { status: "completed" }
  );

  return ride;
};
