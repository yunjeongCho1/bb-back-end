const express = require("express");
const router = express.Router();
const Recommend = require("../schema/recommendschema");
const User = require("../schema/userschema");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");
const Review = require("../schema/reviewschema");

require("dotenv").config();
var api_key = process.env.API_KEY;

var secret_key = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

//추천안쓰는 사용자들
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const user = await User.findById(req.user._id);
    console.log("mypage user: ", user);
    const recommend = await Recommend.findOne({ userId: user._id.toString() });
    console.log("recommend ", recommend);
    if (!recommend && user) {
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

//real 추천
router.post("/foryou", authMiddleware, async (req, res) => {
  try {
    let { categoryId } = req.body;
    console.log("카테고리", categoryId);

    let api_url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${api_key}
    &MaxResults=50&QueryType=Bestseller&CategoryId=${categoryId}&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;

    const response = await axios.get(api_url);
    const books = response.data.item;

    const reviews = await Review.find({
      user_id: req.user._id,
      status: "upload",
    });
    const isbns = reviews.map((item) => item.book.isbn);
    const filteredBooks = books.filter((item) => !isbns.includes(item.isbn13));

    if (filteredBooks.length === 0) {
      api_url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${api_key}
    &MaxResults=50&QueryType=Bestseller&start=2&CategoryId=${categoryId}&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;

      const newResponse = await axios.get(api_url);
      const books = newResponse.data.item;
      console.log("페이지2", books);
      const newFilteredBooks = books.filter(
        (item) => !isbns.includes(item.isbn13)
      );
      return res.status(200).send(newFilteredBooks[0]);
    }
    return res.status(200).send(filteredBooks[0]);
    //console.log("필터북스", filteredBooks);
  } catch (error) {
    console.error("Error like: ", error);
    return res.status(500).send("Error like");
  }
});
module.exports = router;
