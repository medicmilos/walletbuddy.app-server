var nodemailer = require("nodemailer")

exports.sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "appwalletbuddy@gmail.com",
      pass: "^4L*hZtA8j!RAx"
    },
    secure: true
  })

  const mailData = {
    from: "appwalletbuddy@gmail.com",
    to,
    subject,
    html
  }

  await transporter.sendMail(mailData)
}
