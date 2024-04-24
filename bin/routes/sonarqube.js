const router = require("express").Router();
require("dotenv").config();
const verifyToken = require("../utils/validation/apiKey_validation");
const logger = require("../utils/logger/log");
const axios = require("axios");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toDateString()} ${date.toLocaleTimeString()}`;
};

const formatQualityGateCondition = (condition) => {
  const statusEmoji = condition.status === "OK" ? "✅" : "❌";
  const value =
    condition.value !== undefined ? condition.value : "Tidak tersedia";
  return `- ${condition.metric
    .replace(/([A-Z])/g, " $1")
    .trim()}: ${statusEmoji} ${
    condition.status
  } (Nilai: ${value}, Batas Error: ${condition.errorThreshold}, Operator: ${
    condition.operator
  })`;
};

// Endpoint untuk mengirim notifikasi ke Telegram
router.post("/telegram", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const analysedAtFormatted = formatDate(data.analysedAt);

    const qualityGateStatusEmoji =
      data.qualityGate.status === "OK" ? "✅" : "❌";

    const text = `
🔍 *Analisis SonarQube*: ${data.project.name} (${data.project.key})
🔗 [Lihat Dashboard](${data.project.url})
📅 Dianalisis pada: ${analysedAtFormatted}
📈 Status: ${data.status}
🚀 Quality Gate: ${qualityGateStatusEmoji} ${data.qualityGate.status}

*Hasil Quality Gate:*
${data.qualityGate.conditions.map(formatQualityGateCondition).join("\n\n")}

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
    logger.error(err);
    res.status(500).send({
      status: "error",
      message: err,
    });
  }
});

module.exports = router;
