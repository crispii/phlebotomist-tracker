import nodemailer from "nodemailer";
import { EMAIL } from "./config.js";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(clinicianId) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: EMAIL,
      subject: "Clinician Out of Bounds Alert",
      text: `Clinician ${clinicianId} is out of bounds`,
    });

    console.log(`Email sent for clinician ${clinicianId}: ${info.response}`);
  } catch (error) {
    console.log(`Error sending email for clinician ${clinicianId}: ${error}`);
  }
}
