const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Review = require("../schema/reviewschema");
const User = require("../schema/userschema");
//const cors = require("cors");
//router.options("/backup", cors());

require("dotenv").config();
var secret_key = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

// review save/write
router.post("/new", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { book, rating, text, date, status } = req.body;

    const result = await Review.findOne({
      user_id: user._id,
      "book.title": book.title,
      status: "save",
    });
    if (!result) {
      const newReview = new Review({
        book,
        rating,
        text,
        date,
        user_id: user._id,
        status,
      });
      await newReview.save();
      console.log("Review uploaded successfully:", newReview);
      res.status(200).send(newReview._id);
    } else {
      const up_review = await Review.findByIdAndUpdate(result._id, {
        rating,
        text,
        date,
        status,
      });
      console.log("리뷰saved", up_review);
      res.status(200).send(up_review._id);
    }
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

// review load
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let reviews = await Review.find({
      user_id: user._id,
      status: "upload",
    }).sort({ date: -1 });

    if (req.query.sort === "title") {
      reviews.sort((a, b) => a.book.title.localeCompare(b.book.title));
    }

    if (req.query.sort === "date_asc") {
      reviews = reviews.reverse();
    }
    console.log("review.js_sort: ", req.query.sort, "\n" + "-----------------");
    //console.log("review get:", reviews);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error load reviews: ", error);
    res.status(500).send("Error load review");
  }
});

// 임시저장 조회
router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let reviews = await Review.find({
      user_id: user._id,
      status: "save",
    }).sort({ date: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error 임시저장: ", error);
    res.status(500).send("Error load review");
  }
});

//특정 review(id) load
router.get("/detail/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const id_review = await Review.findById(id);
    res.status(200).json(id_review);
  } catch (error) {
    console.error("Error load id: ", error);
    res.status(500).send("Error load id");
  }
});

//특정 review delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);

    const review = await Review.findById(id);

    const user = await User.findById(req.user._id);

    if (user._id.toString() === review.user_id) {
      const del_review = await Review.findByIdAndDelete(id);
      console.log(del_review);
      res.status(200).json(del_review);
    }
  } catch (error) {
    console.error("Error delete : ", error);
    res.status(500).send("Error delete");
  }
});

//특정 review 수정
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    const review = await Review.findById(id);

    const user = await User.findById(req.user._id);
    if (user._id.toString() === review.user_id) {
      const up_review = await Review.findByIdAndUpdate(id, {
        rating: rating,
        text: text,
      });
      console.log(up_review);
      res.status(200).json(up_review);
    }
  } catch (error) {
    console.error("Error update : ", error);
    res.status(500).send("Error update");
  }
});

// 백업 backup
const fs = require("fs");
const path = require("path");

router.get("/backup", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const reviews = await Review.find({ user_id: user._id });

      const backupData = {
        reviews: reviews,
      };

      const backupFileName = `test1_backup.json`;
      const backupFilePath = path.join(__dirname, backupFileName);
      fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
      res.download(backupFilePath, backupFileName, () => {
        // 다운로드 후 백업 파일 삭제
        fs.unlinkSync(backupFilePath);
      });
      res.status(200).json(backupData);
    } else {
      res.status(500).json({ message: "유저를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error("user.js backup error:", error.message);
    res.status(500).send("backup error", error.message);
  }
});

module.exports = router;
