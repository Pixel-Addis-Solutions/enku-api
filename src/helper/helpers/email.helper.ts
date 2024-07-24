import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";
import logger from "../../util/logger";

dotenv.config();

export const sendEmail = async (
  to: string,
  otp: number,
  hasPassword = true
) => {
  try {
    const encodedEmail = encodeURIComponent(to);

    const transportOptions: SMTPTransport.Options = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

    // Configure the email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "OTP Verification",
      html: `<p>Dear User,</p>
             <p>Thank you for choosing our service. Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p>
             <p>Please click the link below to verify your email address and complete the verification process:</p>
             <p><a href="${
               process.env.FRONT_END_URL
             }/verify-email?email=${encodedEmail}&setPassword=${!hasPassword}" style="color: #1a73e8;">
             <strong>Verify your email</strong></a></p>
             <p>Best regards,<br/>The HuluRide Team</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info("Code sent successfully to your email:", info.response);

    return info;
  } catch (error: any) {
    console.log(error);
    logger.error("Failed to send email:", error);
    throw error;
  }
};
export const sendEmailForOtp = async (to: string, otp: number) => {
  try {
    const transportOptions: SMTPTransport.Options = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

    // Configure the email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: "OTP Verification",
      html: `<p>Dear User,</p>
             <p>Thank you for choosing our service. Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p>
             <p>Best regards,<br/>The HuluRide Team</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info("Code sent successfully to your email:", info.response);

    return info;
  } catch (error: any) {
    console.log(error);
    logger.error("Failed to send email:", error);
    throw error;
  }
};
