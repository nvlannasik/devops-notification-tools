const router = require("express").Router();
require("dotenv").config();
const verifyToken = require("../utils/validation/apiKey_validation");
const logger = require("../utils/logger/log");
const axios = require("axios");
const formatMessage = require("../utils/gitlab/telegram-parsing");
const transporter = require("../utils/nodemailer/nodemailer");

// Endpoint untuk mengirim notifikasi ke Telegram
router.post("/telegram", verifyToken, async (req, res) => {
  try {
    const data = req.body;

    const text = formatMessage(data);

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
    logger.error(err); // Log data error dari respons Axios
    res.status(500).send({
      status: "error",
      message: err,
    });
    logger.error(err);
  }
});

// Endpoint untuk mengirim notifikasi ke EMAIL
router.post("/smtp", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const projectPath = data.project.path_with_namespace;
    const pipelineId = data.object_attributes.id;
    const manualJobs = data.builds.filter((build) => build.status === "manual");

    const sendEmailPromises = manualJobs.map((job) => {
      const emailOptions = {
        from: process.env.SMTP_EMAIL_FROM,
        to: process.env.SMTP_EMAIL_TO,
        subject: `Manual Intervention Required for Pipeline #${pipelineId}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial', sans-serif; color: #333; margin: 20px; padding: 0; line-height: 1.5; }
    .container { max-width: 600px; margin: auto; background: #f8f8f8; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h2 { color: #007bff; }
    p, li { margin: 10px 0; }
    a, button { background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; border: none; cursor: pointer; }
    .button-container { text-align: center; margin-top: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Manual Intervention Required</h2>
    <p>The pipeline <b>#${pipelineId}</b> for project <b>${
          data.project.name
        }</b> is awaiting manual intervention at the following stage:</p>
    <ul>
      ${manualJobs
        .map((job) => `<li><strong>${job.name}</strong></li>`)
        .join("")}
    </ul>
    <p>Please review the pipeline and perform the necessary action to proceed.</p>
    <div class="button-container">
      <form action="${
        process.env.ENDPOINT_START_JOB
      }/v1/gitlab/start-job" method="POST">
        <input type="hidden" name="projectId" value="${data.project.id}">
        <input type="hidden" name="jobId" value="${job.id}">
        <input type="hidden" name="projectPath" value="${projectPath}">
        <input type="hidden" name="pipelineId" value="${pipelineId}">
        <button type="submit">Start Job</button>
      </form>
    </div>
  </div>
</body>
</html>        
        `,
      };

      return transporter.sendMail(emailOptions);
    });

    await Promise.all(sendEmailPromises);
    res.status(200).json({ status: "success", message: "Emails sent" });
    logger.info(
      `Emails sent for pipeline #${pipelineId} in project ${projectPath}`
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json({ status: "error", message: "Failed to send emails" });
  }
});

router.post("/start-job", async (req, res) => {
  try {
    const { projectId, jobId, projectPath, pipelineId } = req.body;

    const triggerJobUrl = `${process.env.GITLAB_HOST}/api/v4/projects/${projectId}/jobs/${jobId}/play`;
    console.log(triggerJobUrl);

    await axios.post(
      triggerJobUrl,
      {},
      {
        headers: { "PRIVATE-TOKEN": process.env.GITLAB_API_TOKEN },
      }
    );

    // Redirecting after a POST request might not be ideal. Consider sending a JSON response or rendering a confirmation page.
    res.redirect(
      303,
      `${process.env.GITLAB_HOST}/${projectPath}/-/pipelines/${pipelineId}`
    );
  } catch (err) {
    logger.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

module.exports = router;
