var nodemailer = require("nodemailer");

exports.sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    secure: true,
  });

  const mailData = {
    from: "appwalletbuddy@gmail.com",
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailData);
};
