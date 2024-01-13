const winston = require("winston");
require("dotenv").config();

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// const level = () => {
//   const env = process.env.NODE_ENV || "dev";
//   const isDevelopment = env === "dev";
//   return isDevelopment ? "debug" : "warn";
// };

const color = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(color);

const format = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss:ms" }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} - [${info.level.toUpperCase()}] ${info.message}`
  ),
  winston.format.colorize({ all: true })
);

const transports = [
  new winston.transports.Console(),
  // new winston.transports.File({
  //   filename: "logs/error.log",
  //   level: "error",
  //   maxFiles: 5,
  //   maxsize: 5242880,
  // }),
  // new winston.transports.File({
  //   filename: "logs/all.log",
  //   maxFiles: 5,
  //   maxsize: 5242880,
  // }),
];

const logger = winston.createLogger({
  level: "http",
  levels,
  format,
  transports,
});

module.exports = logger;
