const User = require("../model/User")
const mailer = require("../../mailer")

exports.registerNewUser = async (req, res) => {
  try {
    let isUser = await User.find({ email: req.body.email })
    if (isUser.length >= 1) {
      return res.status(409).json({
        message: "Email already in use"
      })
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
    let data = await user.save()
    const token = await user.generateAuthToken()

    await mailer.sendMail(
      req.body.email,
      "Welcome to WalletBuddy",
      "<p style='font-weight:bold;font-size:14px;'>Welcome! You just joined WalletBuddy.</p>" +
        "<br><br><br>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-bottom: 0;font-weight: bold;'>You've received this email as confirmation of your WalletBuddy account.</p>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-top: 0;font-weight: bold;'>Please do not reply to this email.</p>" +
        "<p style='font-size:14px;text-align:center;'>Copyright 2021 WalletBuddy</p>"
    )

    res.status(201).json({ data, token })
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password

    const user = await User.findByCredentials(email, password)

    if (!user) {
      return res
        .status(401)
        .json({ message: "Login failed! Check authentication credentials" })
    }
    const token = await user.generateAuthToken()
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
exports.getCurrentUser = async (req, res) => {
  await res.json(req.userData)
}
