const axios = require("axios");
const captionModel = require("../Models/caption.model");

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// module.exports.getAddressCoordinates = async (address) => {
//   const apiKey = process.env.GOOGLE_MAPS_API;
//   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//     address
//   )}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     const result = response.data.results[0];
//     if (result && result.geometry && result.geometry.location) {
//       return {
//         lat: result.geometry.location.lat,
//         lng: result.geometry.location.lng,
//       };
//     } else {
//       throw new Error("Unable to fetch coordinates");
//     }
//   } catch (error) {
//     throw error;
//   }
// };

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and Destination are required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No route found!");
      }
      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports.getAutoCompleteSuggestion = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    if (response.data.status === "OK") {
      return response.data.predictions;
    } else {
      throw new Error("Unable to fetch suggestions: " + response.data.status);
    }
  } catch (err) {
    console.error(err);
    throw new Error(err.message || "Error fetching autocomplete suggestions");
  }
};

// module.exports.getCaptionsInTheRadius = async (ltd, lng, radius) => {
//   const captions = await captionModel.find({
//     location: {
//       $geoWithin: {
//         $centerSphere: [[lng, ltd], radius / 3963.2], // radius in radians (radius in miles / Earth's radius in miles)
//       },
//     },
//   });

//   return captions;
// };

module.exports.getCaptionsInTheRadius = async (ltd, lng, radius) => {
  // radius in km

  const captains = await captionModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[ltd, lng], radius / 6371],
      },
    },
  });

  return captains;
};
