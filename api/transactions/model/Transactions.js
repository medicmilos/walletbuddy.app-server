const mongoose = require("mongoose")

const transactionsSchema = mongoose.Schema(
  {
    boardUID: {
      type: String,
      required: [true]
    },
    name: {
      type: String,
      required: [true]
    },
    amount: {
      type: Number,
      required: [true]
    },
    fromUser: {
      type: String,
      required: [false]
    },
    fromUsers: {
      type: Array,
      required: [false]
    },
    incomeToUser: {
      type: String,
      required: [false]
    },
    transType: {
      type: String,
      required: [false]
    },
    expenseType: {
      type: String,
      required: [false]
    },
    incomeType: {
      type: String,
      required: [false]
    }
  },
  {
    timestamps: true
  }
)

const Transactions = mongoose.model("Transactions", transactionsSchema)
module.exports = Transactions
