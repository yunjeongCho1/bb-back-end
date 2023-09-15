const express = require("express");
const router = express.Router();
const axios = require("axios");

const authMiddleware = require("../middleware/authMiddleware");
const Like = require("../schema/likeschema");
const User = require("../schema/userschema");

require("dotenv").config();
var api_key = process.env.API_KEY;
var jwt_secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

router.get("/book/:isbn", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { isbn } = req.params;
    const like = await Like.findOne({ isbn });
    if (like && user) {
      if (like.users.find((u) => u.userId === user._id.toString())) {
        return res.status(200).json(true);
      }
    }
    res.status(200).json(false);
  } catch (error) {
    console.error("Error like: ", error);
    res.status(500).send("Error like");
  }
});

router.post("", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { isbn } = req.body;
    const like = await Like.findOne({ isbn });

    if (like) {
      let users = [];
      if (like.users.find((u) => u.userId === user._id.toString())) {
        console.log("삭제");
        users = like.users.filter((u) => u.userId !== user._id.toString());
        console.log("0000", users);
      } else {
        console.log("추가");
        users = [...like.users, { userId: user._id }];
        console.log(users);
      }

      const up_like = await Like.findOneAndUpdate(
        { _id: like._id },
        { users },
        { new: true }
      );
      console.log("수정", up_like);
    } else {
      const newLike = new Like({
        isbn,
        users: [{ userId: user._id }],
      });
      await newLike.save();
      console.log("새 거 추가");
    }
    res.status(200).json("성공");
  } catch (error) {
    console.error("Error like: ", error);
    res.status(500).send("Error like");
  }
});

router.get("/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

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
    if (req.query.sort === "date_asc")
      // 정렬
      combinedData = [...combinedData].reverse();
    if (req.query.sort === "title")
      combinedData = [...combinedData].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    res.status(200).json(combinedData); // 모든 데이터를 클라이언트에 응답
    //console.log("like.js likes: ", apiUrls);
  } catch (error) {
    console.error("Error like: ", error);
    res.status(500).send("Error like");
  }
});
module.exports = router;
