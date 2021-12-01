const Boards = require("../model/Boards")

exports.createNewBoard = async (req, res) => {
  try {
    const board = new Boards({
      title: req.body.title,
      ownerUID: req.body.ownerUID,
      ballance: req.body.ballance,
      users: req.body.users
    })
    let data = await board.save()

    res.status(201).json({ data })
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getMyBoards = async (req, res) => {
  try {
    const boards = await Boards.find({ ownerUID: req.query.boardUID })

    console.log(req.query.boardUID)
    console.log(boards)

    res.status(201).json(boards)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getSharedBoards = async (req, res) => {
  try {
    const boards = await Boards.find({ users: req.query.email })

    res.status(201).json(boards)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getBoard = async (req, res) => {
  try {
    const board = await Boards.find({ _id: req.query.boardUID })

    res.status(201).json(board)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.inviteUserToBoard = async (req, res) => {
  try {
    const board = await Boards.updateOne(
      { _id: req.body.boardUID },
      { $addToSet: { users: req.body.userEmail } }
    )

    console.log("board: ", board)

    res.status(201).json(board)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
