const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_EMAIL_HOST,
  port: process.env.SMTP_EMAIL_PORT,
  auth: {
    user: process.env.SMTP_EMAIL_USER,
    pass: process.env.SMTP_EMAIL_PASSWORD,
  },
});

module.exports = transporter;
