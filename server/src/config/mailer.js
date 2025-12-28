import nodemailer from 'nodemailer';
import config from './index.js';


const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false, 
  auth: {
    user: config.EMAIL_USER, 
    pass: config.EMAIL_PASS, 
  },
});


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