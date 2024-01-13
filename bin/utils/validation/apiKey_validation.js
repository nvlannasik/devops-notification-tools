require("dotenv").config();
const logger = require("../logger/log");

const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  try {
    if (!apiKey) {
      return res.status(401).json({
        status: "error",
        message: "API key is required, please provide it in x-api-key header",
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
