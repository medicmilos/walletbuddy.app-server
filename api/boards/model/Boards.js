const mongoose = require("mongoose")
const boardsSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Include your title"]
  },
  ownerUID: {
    type: String,
    required: [true]
  },
  ballance: {
    type: Number,
    required: [true]
  },
  users: {
    type: Array,
    required: [true]
  }
})

boardsSchema.statics.getMyBoards = async () => {
  const boards = await Boards.find()
  console.log(boards)
}

boardsSchema.statics.getBoard = async uid => {
  const board = await Boards.findOne({ uid })
  console.log(board)
}

const Boards = mongoose.model("Boards", boardsSchema)
module.exports = Boards
