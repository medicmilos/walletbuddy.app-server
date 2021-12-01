const express = require("express")
const router = express.Router()
const auth = require("../../../config/auth")
const userController = require("../controller/userController")

router.post("/register", userController.registerNewUser)
router.post("/login", userController.loginUser)
router.get("/getCurrentUser", auth, userController.getCurrentUser)

module.exports = router
