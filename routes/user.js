const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Certification = require("../schema/certificationschema");

const User = require("../schema/userschema");
const Review = require("../schema/reviewschema");

require("dotenv").config();
var jwt_secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const Recommend = require("../schema/recommendschema");

//회원가입
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailReg = /^[\w.-]+@[a-zA-Z\d.-]+.[a-zA-Z]{2,}$/;
    const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    const result = await Certification.findOne({
      //email인증여부
      email,
    });
    if (!result || !result.status)
      return res.status(500).send("Unauthenticated email");

    if (emailReg.test(email) && passwordReg.test(password)) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hash, oauth: false });
        await newUser.save();
        //인증 비우는 code
        const del_certi = await Certification.deleteOne({ email });

        console.log("User registered successfully", newUser);
        res.status(200).send("User registered successfully");
      }
    }
  } catch (error) {
    console.error("User Error", error);
    res.status(500).send("User Error");
  }
});
// email 중복 확인
router.post("/checkemail", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Email is already registered:", email);
      return res.status(200).json({ exists: true });
    } else {
      console.log("Email is not registered:", email);
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email", error);
    res.status(503).send("Error checking email");
  }
});

//login
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      if (user.oauth === true) {
        return res.status(200).send("oauth member");
      }
      const pwcheck = await bcrypt.compare(password, user.password);

      if (!pwcheck) {
        res.status(200).send("ID or PW error");
      } else {
        const payload = {
          _id: user._id.toString(),
        };
        const token = jwt.sign(payload, jwt_secret, { expiresIn: "6h" });
        res.status(200).json({
          code: 200,
          message: "토큰이 발급되었습니다.",
          token: token,
        });
      }
    } else {
      res.status(200).send("ID or PW error");
    }
  } catch (error) {
    console.error("User Error", error);
    res.status(500).send("User Error");
  }
});

//회원정보출력 (마이페이지)
router.get("/info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("user.js : ", user, +"\n" + "-------------------");
    res.status(200).send(user);
  } catch (error) {
    console.error("Error decoding token:", error.message);
    res.status(500).send("user.js : error", error.message);
  }
});

//회원탈퇴
router.post("/delete_account", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      const pwcheck = await bcrypt.compare(password, user.password);

      if (!pwcheck) {
        res.status(200).send("ID or PW error!");
      } else {
        const del_certi = await Recommend.deleteOne({ userId: user._id }); // 탈퇴할때 user 삭제
        const del_reviews = await Review.deleteMany({ user_id: user._id });
        const del_user = await User.findByIdAndDelete(user._id);
        console.log("delete: ", del_user);
        res.status(200).json(del_reviews);
      }
    }
  } catch (error) {
    console.error("user.js delete error:", error.message);
    res.status(500).send("delete error", error.message);
  }
});

// pw 변경(그냥 pw 바꾸고 싶을 때)
router.put("/change_password", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { currentPw, newPw } = req.body;

      const currentPw_valid = await bcrypt.compare(currentPw, user.password);
      if (!currentPw_valid) {
        return res.status(200).json("PW Error");
      }

      const newPassword = await bcrypt.hash(newPw, 10);
      user.password = newPassword;
      await user.save();

      res
        .status(200)
        .json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    }
  } catch (error) {
    console.error("user.js change password error:", error.message);
    res.status(500).send("PW Error", error.message);
  }
});

// 비밀번호 재설정 pw
router.put("/reset_password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const newPassword = await bcrypt.hash(password, 10);
      user.password = newPassword;
      await user.save();
      const del_certi = await Certification.deleteOne({ email });

      res
        .status(200)
        .json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    }
  } catch (error) {
    console.error("user.js change password error:", error.message);
    res.status(500).send("PW Error", error.message);
  }
});

module.exports = router;
