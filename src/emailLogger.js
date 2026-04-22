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

export async function sendEmail(clinicianId, alertType = "out_of_zone") {
  const isEndpointFailure = alertType === "endpoint_failed";
  const subject = isEndpointFailure
    ? "Clinician Status Endpoint Failure Alert"
    : "Clinician Out of Zone Alert";
  const text = isEndpointFailure
    ? `Unable to fetch clinician ${clinicianId} status from the clinician status API`
    : `Clinician ${clinicianId} is out of their safety zone`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: EMAIL,
      subject,
      text,
    });

    console.log(`Email sent for clinician ${clinicianId} (${alertType})`);
  } catch (error) {
    console.log(
      `Error sending email for clinician ${clinicianId} (${alertType}): ${error}`,
    );
  }
}
