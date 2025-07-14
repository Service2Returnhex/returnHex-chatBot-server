import nodemailer from "nodemailer";
import { config } from "../config/config";

// Create a test account or replace with real credentials.
const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: config.node_env === "production", // true for 465, false for other ports
    auth: {
      user: config.smtp_auth_user,
      pass: config.smtP_auth_pass,
    },
  });

  // Wrap in an async IIFE so we can use await.

  await transporter.sendMail({
    from: config.smtp_auth_user,
    to,
    subject: "Change Your Password!",
    text: "Reset your password within 10 minute", // plain‑text body
    html // HTML body
  });
};

export default sendEmail
