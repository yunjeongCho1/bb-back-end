const mongoose = require("mongoose");

//certification schema 인증
const certificationSchema = new mongoose.Schema(
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

const Certification = mongoose.model("certification", certificationSchema);
module.exports = Certification;
