const Transactions = require("../model/Transactions");
const Boards = require("../../boards/model/Boards");

exports.makeTransaction = async (req, res) => {
  try {
    const trans = new Transactions({
      boardUID: req.body.boardUID,
      name: req.body.name,
      amount: req.body.amount,
      fromUser: req.body.fromUser,
      fromUsers: req.body.fromUsers,
      incomeToUser: req.body.incomeToUser,
      transType: req.body.transType,
      expenseType: req.body.expenseType,
      incomeType: req.body.incomeType,
    });
    const data = await trans.save();

    if (req.body.transType == "Expense") {
      await Boards.updateOne(
        { _id: req.body.boardUID },
        { $inc: { ballance: -req.body.amount } }
      );
    } else if (req.body.transType == "Income") {
      if (req.body.incomeType == "Single") {
        await Boards.updateOne(
          { _id: req.body.boardUID },
          { $inc: { ballance: req.body.amount } }
        );
      } else if (req.body.incomeType == "Custom") {
      }
    }

    res.status(201).json({ data });
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getBoardTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.find({
      boardUID: req.query.boardUID,
    });

    res.status(201).json(transactions);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getUserBallance = async (req, res) => {
  try {
    const transactionsFrom = await Transactions.find({
      $and: [
        {
          $or: [
            { fromUser: req.query.userEmail },
            { fromUsers: req.query.userEmail },
            { "fromUsers.user": req.query.userEmail },
          ],
        },
        { boardUID: req.query.boardUID },
      ],
    });

    let ballance = 0;

    transactionsFrom.forEach((trans) => {
      if (trans.transType == "Expense") {
        if (trans.expenseType == "Custom split") {
          ballance -= trans.fromUsers.filter((item) => {
            return item.user == req.query.userEmail;
          })[0].amount;
        } else if (trans.expenseType == "Split all") {
          ballance -=
            Math.round((trans.amount / trans.fromUsers.length) * 100) / 100;
        } else if (trans.expenseType == "Single") {
          ballance -= trans.amount;
        }
      } else if (trans.transType == "Income") {
        if (trans.incomeType == "Custom") {
          ballance -= trans.amount;
        }
      }
    });

    const transactionsTo = await Transactions.find({
      $and: [
        {
          $or: [{ incomeToUser: req.query.userEmail }],
        },
        { boardUID: req.query.boardUID },
      ],
    });

    transactionsTo.forEach((trans) => {
      if (trans.incomeType == "Single") {
        ballance += trans.amount;
      } else if (trans.incomeType == "Custom") {
        ballance += trans.amount;
      }
    });

    res.status(201).json(ballance);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getPersonalTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.find({
      $and: [
        {
          $or: [
            { fromUser: req.query.userEmail },
            { fromUsers: req.query.userEmail },
            { "fromUsers.user": req.query.userEmail },
            { incomeToUser: req.query.userEmail },
          ],
        },
        { boardUID: req.query.boardUID },
      ],
    });

    res.status(201).json(transactions);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};
