require("dotenv").config();
const logger = require("../logger/log");

const validateAPIKey = (req, res, next) => {
  const apiKey = req.query.apiKey;

  try {
    if (!apiKey) {
      return res.status(401).json({
        status: "error",
        message: "API key is required, please provide query parameter",
      });
    }

    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({
        status: "error",
        message: "Invalid API key, please provide the correct one",
      });
    }
    next();
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: err,
    });
    logger.error(err);
  }
};

module.exports = validateAPIKey;
