// utils/sendEmail.js
import { createTransport } from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  const transporter = createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"ParkLive" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};

export default sendEmail;
