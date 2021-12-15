const Boards = require("../model/Boards");
const Transactions = require("../../transactions/model/Transactions");
const mailer = require("../../mailer");
const User = require("../../user/model/User");

exports.createNewBoard = async (req, res) => {
  try {
    const board = new Boards({
      title: req.body.title,
      ownerUID: req.body.ownerUID,
      ballance: req.body.ballance,
      users: req.body.users,
      boardCurrency: req.body.boardCurrency,
    });
    let data = await board.save();

    res.status(201).json({ data });
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getMyBoards = async (req, res) => {
  try {
    const boards = await Boards.find({ ownerUID: req.query.boardUID });

    res.status(201).json(boards);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getSharedBoards = async (req, res) => {
  try {
    let boards = await Boards.find({ users: req.query.email });

    console.log("boards: ", boards);

    const user = await User.find({ email: req.query.email });
    console.log("user: ", user);

    boards.forEach((board, index) => {
      console.log("---: ", board.users);
      if (board.ownerUID == user[0]._id) {
        console.log("*", board.title);
        boards.splice(index, 1);
      }
    });

    res.status(201).json(boards);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Boards.find({ _id: req.query.boardUID });

    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.inviteUserToBoard = async (req, res) => {
  try {
    await Boards.updateOne(
      { _id: req.body.boardUID },
      { $addToSet: { users: req.body.userEmail } }
    );

    const board = await Boards.find({ _id: req.body.boardUID });

    await mailer.sendMail(
      req.body.userEmail,
      "Board invitation",
      "<p style='font-size:16px;'>Your have been added to the board '" +
        board[0].title +
        "'.</p>" +
        "<p style='font-size:16px;'>If you don't nave an account, you can register via link: http://localhost:8080/auth/register </p>" +
        "<p style='font-size:16px;'>If you have an account, you can login to see the board." +
        "<br><br><br><br>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-bottom: 0;font-weight: bold;'>You've received this email as you have been added to the board.</p>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-top: 0;font-weight: bold;'>Please do not reply to this email.</p>" +
        "<p style='font-size:14px;text-align:center;'>Copyright 2021 WalletBuddy</p>"
    );

    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.getUsersOnBoard = async (req, res) => {
  try {
    const boardUsers = await Boards.find({ _id: req.query.boardUID });

    const transactions = await Transactions.find({
      boardUID: req.query.boardUID,
    });

    let transactionsByUser = [];
    boardUsers[0].users.forEach((user) => {
      transactions.forEach((trans) => {
        if (trans.fromUser) {
          if (trans.fromUser == user) {
            transactionsByUser.push({ user: user, transaction: trans });
          }
        }
        if (trans.fromUsers) {
          if (trans.fromUsers.length > 0) {
            if (trans.fromUsers[0].user) {
              let arrayOfUsers = trans.fromUsers.map((user) => user.user);

              if (arrayOfUsers.includes(user)) {
                transactionsByUser.push({ user: user, transaction: trans });
              }
            } else {
              if (trans.fromUsers.includes(user)) {
                transactionsByUser.push({ user: user, transaction: trans });
              }
            }
          }
        }
        if (trans.fromUser == null && trans.incomeToUser !== null) {
          if (trans.incomeToUser == user) {
            transactionsByUser.push({ user: user, transaction: trans });
          }
        }
      });
    });

    let ballanceByUser = [];

    transactionsByUser.forEach((trans) => {
      if (trans.transaction.transType == "Expense") {
        if (trans.transaction.expenseType == "Custom split") {
          let amount = -trans.transaction.fromUsers.filter((item) => {
            return item.user == trans.user;
          })[0].amount;

          ballanceByUser.push({ user: trans.user, amount: amount });
        } else if (trans.transaction.expenseType == "Split all") {
          let amount =
            Math.round(
              (-trans.transaction.amount / trans.transaction.fromUsers.length) *
                100
            ) / 100;

          ballanceByUser.push({ user: trans.user, amount: amount });
        } else if (trans.transaction.expenseType == "Single") {
          let amount = -trans.transaction.amount;

          ballanceByUser.push({ user: trans.user, amount: amount });
        }
      }

      if (trans.transaction.transType == "Income") {
        if (trans.transaction.incomeType == "Single") {
          let amount = trans.transaction.amount;

          ballanceByUser.push({
            user: trans.transaction.incomeToUser,
            amount: amount,
          });
        } else if (trans.transaction.incomeType == "Custom") {
          ballanceByUser.push({
            user: trans.transaction.incomeToUser,
            amount: trans.transaction.amount,
          });
          ballanceByUser.push({
            user: trans.transaction.fromUser,
            amount: -trans.transaction.amount,
          });
        }
      }
    });

    let transUsers = [];
    transactions.forEach((trans) => {
      if (trans.incomeToUser) {
        transUsers.push(trans.incomeToUser);
      }
      if (trans.fromUser) {
        transUsers.push(trans.fromUser);
      }
      if (trans.fromUsers) {
        if (trans.fromUsers.length > 0) {
          if (trans.fromUsers[0].user) {
            let arrayOfUsers = trans.fromUsers.map((user) => user.user);

            transUsers.push(...arrayOfUsers);
          } else {
            transUsers.push(...trans.fromUsers);
          }
        }
      }
    });
    transUsers = transUsers.filter((x, i, a) => a.indexOf(x) == i);

    let usersDifference = boardUsers[0].users.filter(
      (x) => !transUsers.includes(x)
    );

    var result = [];
    ballanceByUser.reduce(function (res, value) {
      if (!res[value.user]) {
        res[value.user] = { user: value.user, amount: 0 };
        result.push(res[value.user]);
      }
      res[value.user].amount += value.amount;
      return res;
    }, {});

    usersDifference.forEach((user) => {
      result.push({ user: user, amount: 0 });
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};

exports.sendEmailReminder = async (req, res) => {
  try {
    const board = await Boards.find({ _id: req.body.boardUID });

    await mailer.sendMail(
      req.body.userEmail,
      "Board reminder",
      "<p style='font-size:14px;'>Your ballance on board '" +
        board[0].title +
        "' is: " +
        req.body.ballance +
        "RSD</p>" +
        "<p style='font-size:14px;'>Board message: " +
        req.body.message +
        "</p>" +
        "<br><br><br>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-bottom: 0;font-weight: bold;'>You've received this email as reminder.</p>" +
        "<p style='font-size:12px;color:#ababab;text-align:center;margin-top: 0;font-weight: bold;'>Please do not reply to this email.</p>" +
        "<p style='font-size:14px;text-align:center;'>Copyright 2021 WalletBuddy</p>"
    );

    res.status(201).json(true);
  } catch (err) {
    res.status(400).json({ err: err });
  }
};
