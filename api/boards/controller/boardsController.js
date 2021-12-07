const Boards = require("../model/Boards")
const Transactions = require("../../transactions/model/Transactions")

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

    res.status(201).json(boards)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getSharedBoards = async (req, res) => {
  try {
    let boards = await Boards.find({ users: req.query.email })

    console.log("1: ", boards)

    boards.forEach(board => {
      if (board.users.includes(req.query.email)) {
        boards = []

        console.log("2: ", boards)
      }
    })

    console.log("3: ", boards)

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

    res.status(201).json(board)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getUsersOnBoard = async (req, res) => {
  try {
    const boardUsers = await Boards.find({ _id: req.query.boardUID })

    const transactions = await Transactions.find({
      boardUID: req.query.boardUID
    })

    let transactionsByUser = []
    boardUsers[0].users.forEach(user => {
      transactions.forEach(trans => {
        if (trans.fromUser) {
          if (trans.fromUser == user) {
            transactionsByUser.push({ user: user, transaction: trans })
          }
        }
        if (trans.fromUsers) {
          if (trans.fromUsers[0].user) {
            let arrayOfUsers = trans.fromUsers.map(user => user.user)

            if (arrayOfUsers.includes(user)) {
              transactionsByUser.push({ user: user, transaction: trans })
            }
          } else {
            if (trans.fromUsers.includes(user)) {
              transactionsByUser.push({ user: user, transaction: trans })
            }
          }
        }
      })
    })

    let ballanceByUser = []

    transactionsByUser.forEach(trans => {
      if (trans.transaction.expenseType == "Custom split") {
        let amount = -trans.transaction.fromUsers.filter(item => {
          return item.user == trans.user
        })[0].amount

        ballanceByUser.push({ user: trans.user, amount: amount })
      } else if (trans.transaction.expenseType == "Split all") {
        let amount =
          -trans.transaction.amount / trans.transaction.fromUsers.length

        ballanceByUser.push({ user: trans.user, amount: amount })
      } else if (trans.transaction.expenseType == "Single") {
        let amount = -trans.transaction.amount

        ballanceByUser.push({ user: trans.user, amount: amount })
      }
    })

    console.log("ballanceByUser: ", ballanceByUser)

    var result = []
    ballanceByUser.reduce(function (res, value) {
      if (!res[value.user]) {
        res[value.user] = { user: value.user, amount: 0 }
        result.push(res[value.user])
      }
      res[value.user].amount += value.amount
      return res
    }, {})

    console.log("result: ", result)

    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
