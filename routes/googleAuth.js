const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const router = express.Router();

require("dotenv").config();

const User = require("../schema/userschema");

router.get("/google", async (req, res) => {
  try {
    const access_token = req.query.access_token;
    console.log(access_token);
    if (!access_token) {
      return res.status(400).send("access_token not provided");
    }

    const USER_INFO_REQUEST_URL =
      "https://www.googleapis.com/oauth2/v1/userinfo";
    const result = await axios.get(USER_INFO_REQUEST_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (result.status === 200) {
      const email = result.data.email;
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
        return res.status(200).send(`callback?token=${token}`);
      }
    } else {
      return res.status(result.status).send("Error retrieving user info");
    }
  } catch (error) {
    console.error(error);
    return res.redirect("/error");
  }
});

module.exports = router;
