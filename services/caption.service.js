const caption = require("../Models/caption.model");
const express = require("express");

module.exports.createCaption = async ({
  email,
  fullname,
  password,
  color,
  plate,
  capacity,
  vehicleType,
}) => {
  if (
    !email ||
    !fullname?.firstname ||
    !fullname?.lastname || // ✅ check lastname too
    !password ||
    !color ||
    !plate ||
    !capacity ||
    !vehicleType
  ) {
    throw new Error("All Fields are required");
  }

  const newCaption = await caption.create({
    email,
    fullname: {
      firstname: fullname.firstname,
      lastname: fullname.lastname, // ✅ store separately
    },
    password,
    vehicle: {
      color,
      plate,
      capacity,
      vehicleType,
    },
  });

  return newCaption;
};
