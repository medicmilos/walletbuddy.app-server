const Transactions = require("../model/Transactions")

exports.makeTransaction = async (req, res) => {
  try {
    const trans = new Transactions({
      test: req.body.test
    })
    let data = await trans.save()

    res.status(201).json({ data })
  } catch (err) {
    res.status(400).json({ err: err })
  }
}
