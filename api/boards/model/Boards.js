const mongoose = require("mongoose")
const boardsSchema = mongoose.Schema(
  {
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
    },
    boardCurrency: {
      type: String,
      required: [true]
    },
  },
  {
    timestamps: true
  }
)

boardsSchema.statics.getMyBoards = async () => {
  await Boards.find()
}

boardsSchema.statics.getBoard = async uid => {
  await Boards.findOne({ uid })
}

const Boards = mongoose.model("Boards", boardsSchema)
module.exports = Boards
