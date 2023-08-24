const express = require("express");
const router = express.Router();
const Review = require("../schema/reviewschema");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../schema/userschema");
const Like = require("../schema/likeschema");
const axios = require("axios");

require("dotenv").config();
var api_key = process.env.API_KEY;
var secret_key = process.env.SECRET_KEY;

const jwt = require("jsonwebtoken");

router.get("/book", function (req, res) {
  var api_url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${api_key}&Query=${encodeURI(
    req.query.query
  )}&QueryType=Title&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;
  var request = require("request");
  var options = {
    url: api_url,
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});

// 후기 검색
router.get("/review", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);

    const result = await Review.find({
      user_id: user._id,
      status: "upload",
      "book.title": { $regex: req.query.query, $options: "i" },
    });

    console.log("!!!!!!!!!!", req.query);
    console.log("Result:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).send("Error");
  }
});

//관심도서 검색
router.get("/my_list", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);

    let likes = await Like.find({
      "users.userId": user._id.toString(),
    }).sort({ "users.timestamp": -1 });
    console.log("likes :", likes);

    const apiUrls = likes.map(
      (like) =>
        `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${api_key}&itemIdType=ISBN13&ItemId=${like.isbn}&Cover=Big&output=js&Version=20131101`
    ); // ISBN만 추출하여 새로운 배열 생성
    const apiRequests = apiUrls.map((url) => axios.get(url)); // API 요청을 생성하여 배열로 저장
    const apiResponses = await Promise.all(apiRequests); // 모든 API 요청을 병렬로 실행하고 응답을 받음

    let combinedData = apiResponses.map((response) => response.data.item[0]);
    const result = combinedData.filter((a) =>
      a.title.includes(req.query.query)
    );

    res.status(200).json(result); // 모든 데이터를 클라이언트에 응답
    //console.log("like.js likes: ", apiUrls);
  } catch (error) {
    console.error("Error like: ", error);
    res.status(500).send("Error like");
  }
});

module.exports = router;
