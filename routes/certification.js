const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const router = express.Router();
const Certification = require("../schema/certificationschema");

// Nodemailer transporter 설정
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "team.bookbook@gmail.com", // Gmail 계정 이메일
    pass: process.env.PASS, // Gmail 계정 비밀번호 (보안에 주의하세요)
  },
});

// 무작위 인증번호 생성 함수
function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000); // 4자리 무작위 숫자
}

router.post("/send-email", (req, res) => {
  const { email } = req.body;
  //const email = "yjcho0907@gmail.com"; // 수신자 이메일 주소
  const code = generateRandomCode(); // 인증번호 생성
  const currentTime = new Date();
  const expiresAt = new Date(currentTime.getTime() + 1 * 60000);

  // 이메일 옵션 구성
  const mailOptions = {
    from: "team.bookbook@gmail.com", // 보내는 사람 이메일 (Gmail 계정)
    to: email, // 수신자 이메일
    subject: "[북북] 이메일 인증번호입니다.", // 이메일 제목
    html: `<p>북북 회원가입을 위한 이메일 인증번호입니다.</p><p><strong><span style="font-size: 18px;">
    인증번호: ${code}</span></strong></p><p>
    30분 안에 인증해주세요!</p>`,
  };

  // 이메일 전송
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.error("이메일 전송 오류:", error);
      res.status(500).send("이메일 전송 실패");
    } else {
      const del_certi = await Certification.deleteOne({ email });
      const newCerti = new Certification({
        email,
        code,
        expiresAt,
        status: false,
      });
      await newCerti.save();
      console.log("이메일 전송 성공:", info.response);
      res.status(200).send("이메일 전송 성공");
    }
  });
});

//검증
router.post("/verify-code", async (req, res) => {
  const { userCode, email } = req.body; // 사용자가 입력한 인증번호, 사용자 이메일

  const verificationCode = await Certification.findOne({
    email,
    code: userCode,
    expiresAt: { $gte: new Date() }, // 유효 기간 내에 있는지 확인
  });

  if (verificationCode) {
    const up_certi = await Certification.findByIdAndUpdate(
      verificationCode._id,
      {
        status: true,
      }
    );
    console.log("certifiaction.js : 인증 성공");
    res.status(200).send(true);
  } else {
    res.status(200).send(false);
  }
});

// 인증상태 return status
router.get("/certi-status/:email", async (req, res) => {
  const { email } = req.params;
  const result = await Certification.findOne({
    email,
  });
  if (!result) return res.status(200).send("no status");
  res.status(200).send(result.status);
});
module.exports = router;
