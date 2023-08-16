const mongoose = require("mongoose");

//Like schema
const likeSchema = new mongoose.Schema(
  {
    isbn: String,
    users: [String],
  },
  { versionKey: false }
);

const Like = mongoose.model("Like", likeSchema);
module.exports = Like;
