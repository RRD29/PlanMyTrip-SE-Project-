import nodemailer from 'nodemailer';
import config from './index.js';

/**
 * Creates a reusable Nodemailer transporter object
 * configured for Gmail.
 */
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: config.EMAIL_USER, // Your Gmail address
    pass: config.EMAIL_PASS, // Your Gmail "App Password"
  },
});

/**
 * A utility function to send an email.
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
export const sendEmail = async (to, subject, text, html) => {
  if (!config.EMAIL_USER) {
    console.warn("EMAIL_USER not set. Skipping email send.");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"PlanMyTrip" <${config.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default transporter;