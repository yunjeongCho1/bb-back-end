const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();

require("dotenv").config();

const User = require("../schema/userschema");

router.get("/google", async (req, res) => {
  const code = req.query.code; // 인가 코드
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  // 구글에 access token 요청
  const result = await axios.post(
    `https://oauth2.googleapis.com/token?grant_type=authorization_code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRET}&code=${code}`
  );

  // 구글에서 받아온 access token
  const access_token = result.data.access_token;

  if (!access_token) {
    return res.status(400).send("access_token not provided");
  }

  // 구글에 사용자 정보 요청
  const USER_INFO_REQUEST_URL = "https://www.googleapis.com/oauth2/v1/userinfo";
  const info_res = await axios.get(USER_INFO_REQUEST_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (info_res.status === 200) {
    const email = info_res.data.email;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const newUser = new User({ email, password: "", oauth: true });
      await newUser.save();
      const payload = {
        _id: newUser._id.toString(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "6h",
      });
      return res.status(200).send(`callback?token=${token}`);
    } else if (existingUser.oauth === false) {
      return res.status(200).send(`callback?userExists=true`);
    } else if (existingUser.oauth === true) {
      const payload = {
        _id: existingUser._id.toString(),
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "6h",
      });
      console.log(token);

      return res.status(200).send(`callback?token=${token}`);
    }
  } else {
    return res.status(400).send("cannot get user info");
  }

  res.status(200).send("성공");
});

module.exports = router;
