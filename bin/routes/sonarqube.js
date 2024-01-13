const router = require("express").Router();
require("dotenv").config();
const verifyToken = require("../utils/validation/apiKey_validation");
const logger = require("../utils/logger/log");
const axios = require("axios");

//WEBHOOK SONARQUBE TO TELEGRAM

router.post("/telegram", async (req, res) => {
  try {
    const data = req.body;

    const text = `
🔍 *Analisis SonarQube*: ${data.project.name} (${data.project.key})
🔗 [Lihat Dashboard](${data.project.url})
📅 Dianalisis pada: ${data.analysedAt}
📈 Status: ${data.status}
🚀 Quality Gate: ${data.qualityGate.status}

*Hasil Quality Gate:*
${data.qualityGate.conditions
  .map(
    (condition) => `
- ${condition.metric}: ${condition.status} (Nilai: ${condition.value}, Batas Error: ${condition.errorThreshold}, Operator: ${condition.operator})
`
  )
  .join("")}

[Commit: ${data.revision.substring(0, 7)}](${data.serverUrl}/dashboard?id=${
      data.project.key
    }&pullRequest=${data.taskId})
`.trim();

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const chatId = process.env.TELEGRAM_CHAT_ID_SONARQUBE;

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
