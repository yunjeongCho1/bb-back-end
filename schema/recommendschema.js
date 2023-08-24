const mongoose = require("mongoose");

//recommend schema
const recommendSchema = new mongoose.Schema(
  {
    userId: String,
  },
  { versionKey: false }
);

const Recommend = mongoose.model("Recommend", recommendSchema);
module.exports = Recommend;
