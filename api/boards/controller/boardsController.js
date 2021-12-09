const Boards = require("../model/Boards")
const Transactions = require("../../transactions/model/Transactions")
const mailer = require("../../mailer")

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

    boards.forEach(board => {
      if (board.users.includes(req.query.email)) {
        boards = []
      }
    })

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
        if (trans.fromUser == null && trans.incomeToUser !== null) {
          if (trans.incomeToUser == user) {
            transactionsByUser.push({ user: user, transaction: trans })
          }
        }
      })
    })

    let ballanceByUser = []

    transactionsByUser.forEach(trans => {
      if (trans.transaction.transType == "Expense") {
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
      }

      if (trans.transaction.transType == "Income") {
        if (trans.transaction.incomeType == "Single") {
          let amount = trans.transaction.amount

          ballanceByUser.push({
            user: trans.transaction.incomeToUser,
            amount: amount
          })
        } else if (trans.transaction.incomeType == "Custom") {
          ballanceByUser.push({
            user: trans.transaction.incomeToUser,
            amount: trans.transaction.amount
          })
          ballanceByUser.push({
            user: trans.transaction.fromUser,
            amount: -trans.transaction.amount
          })
        }
      }
    })

    var result = []
    ballanceByUser.reduce(function (res, value) {
      if (!res[value.user]) {
        res[value.user] = { user: value.user, amount: 0 }
        result.push(res[value.user])
      }
      res[value.user].amount += value.amount
      return res
    }, {})

    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.sendEmailReminder = async (req, res) => {
  try {
    const board = await Boards.find({ _id: req.body.boardUID })

    await mailer.sendMail(
      req.body.userEmail,
      "Board reminder",
      "<p style='font-size:16px;'>Your ballance on board '" +
        board[0].title +
        "' is: " +
        req.body.ballance +
        "</p>" +
        "<br><br>" +
        "<p style='font-size:16px;'>Board message: " +
        req.body.message +
        "</p>" +
        "<br><br><br><br>" +
        "<p style='font-size:12px;color:#ccc;text-align:center;margin-bottom: 0;'>You've received this email as reminder.</p>" +
        "<p style='font-size:12px;color:#ccc;text-align:center;margin-top: 0;'>Please do not reply to this email.</p>" +
        "<p style='font-size:14px;text-align:center;'>Copyright 2021 WalletBuddy</p>"
    )

    res.status(201).json(true)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
