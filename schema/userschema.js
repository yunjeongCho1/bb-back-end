const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    oauth: Boolean,
  },
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
