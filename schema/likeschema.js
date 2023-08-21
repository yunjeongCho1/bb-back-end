const mongoose = require("mongoose");

//Like schema
const likeSchema = new mongoose.Schema(
  {
    isbn: String,
    users: [
      {
        userId: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { versionKey: false }
);

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
