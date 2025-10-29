import { sendEmail } from '../config/mailer.js';
import config from '../config/index.js'; // <-- KEEP ONLY THIS ONE IMPORT
import { User } from '../models/user.model.js'; // Required for finding user/guide emails

/**
 * Sends a welcome email to a new user.
 * @param {string} userEmail - The new user's email.
 * @param {string} fullName - The new user's full name.
 */
export const sendWelcomeEmail = async (userEmail, fullName) => {
  const subject = "Welcome to PlanMyTrip!";
  const text = `Hi ${fullName},\n\nWelcome to PlanMyTrip! We're excited to help you plan your next adventure.\n\nBest,\nThe PlanMyTrip Team`;
  const html = `<p>Hi ${fullName},</p><p>Welcome to <strong>PlanMyTrip</strong>! We're excited to help you plan your next adventure.</p><p>Best,<br>The PlanMyTrip Team</p>`;

  await sendEmail(userEmail, subject, text, html);
};

/**
 * Sends the booking confirmation and OTPs to both the user and the guide.
 * @param {object} booking - The booking object from the database.
 * @param {object} user - The user object.
 * @param {object} guide - The guide object.
 */
export const sendBookingOtpEmail = async (booking, user, guide) => {
  const bookingUrl = `${config.CLIENT_URL}/booking/${booking._id}/verify`;

  // --- 1. Email to the User ---
  const userSubject = `Your PlanMyTrip Booking is Confirmed! (ID: ${booking._id})`;
  const userText = `Hi ${user.fullName},\n\nYour trip to ${booking.tripDetails.destination} with ${guide.fullName} is confirmed!\n\nAt your meet-up, give this code to your guide: ${booking.otpUser}\nYour guide will give you a code to enter here: ${bookingUrl}\n\nEnjoy your trip!`;
  const userHtml = `
    <p>Hi ${user.fullName},</p>
    <p>Your trip to <strong>${booking.tripDetails.destination}</strong> with <strong>${guide.fullName}</strong> is confirmed!</p>
    <hr>
    <p><strong>Your User OTP:</strong></p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${booking.otpUser}</p>
    <p>At your meet-up, show this code to your guide.</p>
    <hr>
    <p>Your guide will give you a code to enter. You can verify it at the link below:</p>
    <a href="${bookingUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Guide's OTP</a>
    <p>Enjoy your trip!</p>
  `;
  await sendEmail(user.email, userSubject, userText, userHtml);

  // --- 2. Email to the Guide ---
  const guideSubject = `New Booking Confirmation with ${user.fullName} (ID: ${booking._id})`;
  const guideText = `Hi ${guide.fullName},\n\nYou have a new confirmed trip with ${user.fullName} for ${booking.tripDetails.destination}.\n\nAt your meet-up, give this code to the user: ${booking.otpGuide}\nThe user will give you a code to enter here: ${bookingUrl}\n\nGood luck!`;
  const guideHtml = `
    <p>Hi ${guide.fullName},</p>
    <p>You have a new confirmed trip with <strong>${user.fullName}</strong> for <strong>${booking.tripDetails.destination}</strong>.</p>
    <hr>
    <p><strong>Your Guide OTP:</strong></p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${booking.otpGuide}</p>
    <p>At your meet-up, show this code to the user.</p>
    <hr>
    <p>The user will give you a code to enter. You can verify it at the link below:</p>
    <a href="${bookingUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify User's OTP</a>
    <p>Good luck!</p>
  `;
  await sendEmail(guide.email, guideSubject, guideText, guideHtml);
};

/**
 * Sends a password reset email.
 * @param {string} userEmail - The user's email.
 * @param {string} resetToken - The *unhashed* password reset token.
 */
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`; // Link to frontend page
  const subject = "Reset Your PlanMyTrip Password";
  const text = `Hi,\n\nYou requested a password reset. Click the link below to set a new password. This link is valid for 10 minutes.\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nBest,\nThe PlanMyTrip Team`;
  const html = `
    <p>Hi,</p>
    <p>You requested a password reset. Click the button below to set a new password. This link is valid for 10 minutes.</p>
    <a href="${resetUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best,<br>The PlanMyTrip Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
};