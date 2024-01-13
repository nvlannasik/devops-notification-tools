const express = require("express");
const app = express();
const config = require("../config/global_config");
const bodyParser = require("body-parser");
const cors = require("cors");
const morganMiddleware = require("../utils/logger/morgan");
const logger = require("../utils/logger/log");
require("dotenv").config();
const sonarqubeRoutes = require("../routes/sonarqube");
const gitlabRoutes = require("../routes/gitlab");

class AppServer {
  constructor() {
    this.app = app;
    this.config();
    this.routes();
    this.healthCheck();
  }

  config() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(morganMiddleware);
  }

  routes() {
    this.app.use("/v1/sonarqube", sonarqubeRoutes);
    this.app.use("/v1/gitlab", gitlabRoutes);
  }

  healthCheck() {
    this.app.get("/healthz", (req, res) => {
      res.status(200).json({
        status: "success",
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date(Date.now()).toString(),
      });
    });
  }

  async start() {
    try {
      this.app.listen(config.get("/port"));
      logger.info(
        `Server started on port ${config.get("/port")} (${config.get("/env")})`
      );
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }
}

module.exports = AppServer;
