const mongoose = require("mongoose")
const transactionsSchema = mongoose.Schema({
  test: {
    type: String,
    required: [true, "Please Include your title"]
  }
})

const Transactions = mongoose.model("Transactions", transactionsSchema)
module.exports = Transactions
