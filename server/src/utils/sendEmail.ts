import sgMail from "@sendgrid/mail";

interface Email {
  to: string;
  subject: string;
  html: string;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(email: Email) {
  await sgMail.send({
    from: '"reddit-clone" <reddit-clone@oalashqar.me>',
    ...email,
  });
}
