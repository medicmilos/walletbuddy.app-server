const express = require("express")
const router = express.Router()
const auth = require("../../../config/auth")
const boardsController = require("../controller/boardsController")

router.get("/getMyBoards", boardsController.getMyBoards)
router.post("/createNewBoard", auth, boardsController.createNewBoard)
router.get("/getBoard", boardsController.getBoard)
router.post("/inviteUserToBoard", boardsController.inviteUserToBoard)
router.get("/getSharedBoards", boardsController.getSharedBoards)
router.get("/getUsersOnBoard", boardsController.getUsersOnBoard)
router.post("/sendEmailReminder", boardsController.sendEmailReminder)

module.exports = router
