const express = require("express");
const router = express.Router();
const Review = require("../schema/reviewschema");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../schema/userschema");

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

module.exports = router;
