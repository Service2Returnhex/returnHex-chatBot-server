import nodemailer from "nodemailer";
import { config } from "../config/config";

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: config.node_env === "production",
    auth: {
      user: config.smtp_auth_user,
      pass: config.smtp_auth_pass,
    },
  });

  return await transporter.sendMail({
    from: config.smtp_auth_user,
    to: [],
    bcc: to,
    subject,
    html,
  });
};

export default sendEmail;
