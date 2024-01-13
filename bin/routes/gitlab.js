const router = require("express").Router();
require("dotenv").config();
const verifyToken = require("../utils/validation/apiKey_validation");
const logger = require("../utils/logger/log");
const axios = require("axios");

router.post("/telegram", async (req, res) => {
  try {
    const data = req.body;

    const getStatusIcon = (status) => {
      switch (status) {
        case "success":
          return "✅";
        case "running":
          return "⏳";
        case "failed":
          return "❌";
        default:
          return "⚪";
      }
    };

    const text = `
    🚀 *GitLab Pipeline Update* 
    📦 Project: ${data.project.name}
    🔖 Branch: ${data.object_attributes.ref}
    🔗 [Pipeline URL](${data.object_attributes.url})
    
    🔧 Status: ${getStatusIcon(
      data.object_attributes.status
    )} ${data.object_attributes.status.toUpperCase()}
    ⏳ Duration: ${data.object_attributes.duration} seconds
    📅 Finished at: ${data.object_attributes.finished_at}
    
    🛠️ *Stages:*
    ${data.builds
      .map(
        (build) =>
          `  ${getStatusIcon(build.status)} ${build.stage}: ${build.status}`
      )
      .join("\n")}
    
    
    👷 *Last Commit:*
      - ID: ${data.commit.id}
      - Message: ${data.commit.message.trim()}
      - Author: ${data.commit.author.name}
      - [Commit URL](${data.commit.url})
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatId = process.env.TELEGRAM_CHAT_ID_GITLAB;

    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: text,
      parse_mode: "markdown",
    });

    res.status(200).json({
      status: "success",
      message: "OK",
    });
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: err,
    });
    logger.error(err);
  }
});

module.exports = router;
