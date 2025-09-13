const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");

module.exports.getCoordinates = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.query;
  try {
    const coordinates = await mapService.getAddressCoordinates(address);
    res.status(200).json(coordinates);
  } catch (err) {
    res.status(404).json({ message: "coordinate not found" });
  }
};

module.exports.getDistanceTime = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination } = req.query;

  try {
    const distanceTime = await mapService.getDistanceTime(origin, destination);
    res.status(200).json(distanceTime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch distance and time" });
  }
};

module.exports.getAutoCompleteSuggestion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { input } = req.query;
  try {
    const suggestions = await mapService.getAutoCompleteSuggestion(input);
    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch autocomplete suggestions" });
  }
};
