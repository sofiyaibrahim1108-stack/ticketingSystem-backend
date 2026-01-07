import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,       
    pass: process.env.MAIL_PASSWORD    
  }
});

export default async function sendMail({ to, subject, text }) {
  if (!to) {
    throw new Error("No recipient email provided");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text
    });
    console.log("Mail sent:", info.response);
    return info;
  } catch (err) {
    console.error("Error sending mail:", err);
    throw err;  
  }
}
