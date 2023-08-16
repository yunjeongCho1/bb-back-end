const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Like = require("../schema/likeschema");
const User = require("../schema/userschema");

require("dotenv").config();
var secret_key = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

router.get("/:isbn", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);

    const { isbn } = req.params;
    const like = await Like.findOne({ isbn });
    if (like && user) {
      if (like.users.includes(user._id)) {
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
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);

    const { isbn } = req.body;
    const like = await Like.findOne({ isbn });
    if (like) {
      let users = [];
      if (like.users.includes(user._id))
        users = like.users.filter((a) => a !== user._id);
      else users = [...like.users, user._id];

      const up_like = await Like.findByIdAndUpdate(like._id, { users });
      console.log("수정", up_like);
    } else {
      const newLike = new Like({
        isbn,
        users: [user._id],
      });
      await newLike.save();
      console.log("됨됨되미ㅗㄷ미ㅗ미ㅗ디뫼");
    }
    res.status(200).json("성공");
  } catch (error) {
    console.error("Error like: ", error);
    res.status(500).send("Error like");
  }
});

module.exports = router;
