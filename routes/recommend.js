const express = require("express");
const router = express.Router();
const Recommend = require("../schema/recommendschema");
const User = require("../schema/userschema");
const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();
var secret_key = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

//추천안쓰는 사용자들
router.post("/", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);
    const recommend = await Recommend.findOne({ userId: user._id.toString() });
    if (user) {
      if (recommend) {
        const del_reco = await Recommend.findByIdAndDelete(recommend._id);
        console.log("삭제완");
        return res.status(200).json(del_reco);
      } else {
        const newReco = new Recommend({
          userId: user._id,
        });
        await newReco.save();
        console.log("추천안받는 사람 컬렉션에 추가");
        return res.status(200).json(newReco);
      }
    }
    return res.status(500).send("nouser"); // 모든 데이터를 클라이언트에 응답
  } catch (error) {
    console.error("Error like: ", error);
    return res.status(500).send("Error like");
  }
});

//조회(mypage 들어갔을 때 추천 on/off 확인)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);
    const recommend = await Recommend.findOne({ userId: user._id.toString() });

    if (recommend && user) {
      console.log(
        "recommend.js: 추천 기능 조회" + "\n" + "----------------------"
      );
      return res.status(200).json(true);
    }

    res.status(200).json(false);
  } catch (error) {
    console.error("추천 조회 오류: ", error);
    res.status(500).send(error);
  }
});

module.exports = router;
