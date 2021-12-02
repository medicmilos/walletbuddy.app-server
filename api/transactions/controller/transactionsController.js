const Transactions = require("../model/Transactions")
const Boards = require("../../boards/model/Boards")

exports.makeTransaction = async (req, res) => {
  try {
    const trans = new Transactions({
      boardUID: req.body.boardUID,
      name: req.body.name,
      amount: req.body.amount,
      fromUser: req.body.fromUser,
      fromUsers: req.body.fromUsers,
      transType: req.body.transType,
      expenseType: req.body.expenseType
    })
    const data = await trans.save()

    await Boards.updateOne(
      { _id: req.body.boardUID },
      { $inc: { ballance: -req.body.amount } }
    )

    res.status(201).json({ data })
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getBoardTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.find({
      boardUID: req.query.boardUID
    })

    res.status(201).json(transactions)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}

exports.getUserBallance = async (req, res) => {
  try {
    const transactions = await Transactions.find({
      $and: [
        {
          $or: [
            { fromUser: req.query.userEmail },
            { fromUsers: req.query.userEmail },
            { "fromUsers.user": req.query.userEmail }
          ]
        },
        { boardUID: req.query.boardUID }
      ]
    })

    let ballance = 0

    transactions.forEach(trans => {
      if (trans.expenseType == "Custom split") {
        ballance -= trans.fromUsers.filter(item => {
          return item.user == req.query.userEmail
        })[0].amount
      } else if (trans.expenseType == "Split all") {
        ballance -= trans.amount / trans.fromUsers.length
      } else if (trans.expenseType == "Single") {
        ballance -= trans.amount
      }
    })

    res.status(201).json(ballance)
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
