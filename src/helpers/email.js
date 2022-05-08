import sgMail from "@sendgrid/mail";
import { sendGridApiKey, verificationEmail, host } from "../config";

sgMail.setApiKey(sendGridApiKey);
export const generateVerifyTemplate = ({
  name = "",
  email = "",
  token = "",
}) => {
  if (!name || !email || !token) throw new Error("Invalid object");
  return {
    to: email,
    from: verificationEmail,
    subject: "Verify your email",
    html: `
  <h1>Verify your email</h1>
  <p>Hi ${name},</p>
  <p>Please verify your email by clicking the link below:</p>
  <a href="${host}?token=${token}">${host}/api/auth/verify?token=${token}</a>
  <h1>Thank you!</h1>
  <p>If you haven't request the password reset please ignore this email</p>
  <h1> Copyright © ${new Date().getFullYear()} Sostene</h1>
    `,
  };
};
export const generateReplyMessageTemplate = ({
  name = "",
  email = "",
  message = "",
}) => {
  if (!name || !email || !message) throw new Error("Invalid object");
  return {
    to: email,
    from: verificationEmail,
    subject: "Message reply",
    html: `
  <h1>Message reply</h1>
  <p>Hi ${name}, </p>
  <p>Sostene replied with this message</p>
  <p>${message}</p>
  <h1>Thank you!</h1>
  <h1> Copyright © ${new Date().getFullYear()} Sostene</h1>
    `,
  };
};
export const generatePasswordResetTemplate = ({
  name = "",
  email = "",
  token = "",
}) => {
  if (!name || !email || !token) throw new Error("Invalid object");
  return {
    to: email,
    from: verificationEmail,
    subject: "Password reset",
    html: `
  <h1>Password request</h1>
  <p>Hi ${name},</p>
  <p>To change your password please click the link below:</p>
  <a href="${host}/api/auth/passwordReset?token=${token}">${host}/api/auth/passwordReset?token=${token}</a>
  <h1>Thank you!</h1>
  <p>If you haven't request the password reset please ignore this email</p>
  <h1> Copyright © ${new Date().getFullYear()} Sostene</h1>
    `,
  };
};
export const sendEmail = async (template, multiple = false) =>
  new Promise((resolve, reject) => {
    sgMail.send(template, multiple, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

