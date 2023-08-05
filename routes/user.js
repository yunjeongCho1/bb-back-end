const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../schema/userschema");

// user data save
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailReg = /^[\w.-]+@[a-zA-Z\d.-]+.[a-zA-Z]{2,}$/;
    const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    console.log(emailReg.test(email), passwordReg.test(password));
    console.log(password);
    if (emailReg.test(email) && passwordReg.test(password)) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hash });
        await newUser.save();

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
module.exports = router;
