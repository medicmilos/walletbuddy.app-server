const express = require("express")
const router = express.Router()
const transactionsController = require("../controller/transactionsController")

router.post("/makeTransaction", transactionsController.makeTransaction)
router.get("/getBoardTransactions", transactionsController.getBoardTransactions)
router.get("/getUserBallance", transactionsController.getUserBallance)

module.exports = router
