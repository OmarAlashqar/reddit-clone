import nodemailer from "nodemailer";
import { nodemailerCreds } from "../constants";

interface Email {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(email: Email) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: nodemailerCreds,
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"reddit-clone" <reddit-clone@no-reply.com>', // sender address
    ...email,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
