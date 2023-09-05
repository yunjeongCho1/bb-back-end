const mongoose = require("mongoose");

//certification schema 인증
const certificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    status: { type: Boolean, required: true },
  },
  { versionKey: false }
);

const Certification = mongoose.model("certification", certificationSchema);
module.exports = Certification;
