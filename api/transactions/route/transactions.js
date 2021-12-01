const express = require("express")
const router = express.Router()
const transactionsController = require("../controller/transactionsController")

router.post("/makeTransaction", transactionsController.makeTransaction)

module.exports = router
