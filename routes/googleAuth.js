const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const router = express.Router();

require("dotenv").config();

const User = require("../schema/userschema");

// express-session 미들웨어 추가
router.use(
  session({
    secret: process.env.SESSION_SECRET, // 임의의 시크릿 키
    resave: false,
    saveUninitialized: true,
  })
);

// Passport 초기화 및 세션 설정
router.use(passport.initialize());
router.use(passport.session());

// 세션을 사용하기 위한 serializeUser 및 deserializeUser 설정
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // 사용자 정보 확인 후 JWT 토큰 생성
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
      };
      const token = jwt.sign(user, process.env.JWT_SECRET);
      return done(null, token);
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    // 로그인 성공 > JWT 토큰을 생성하고 리다이렉트할 경로에 추가
    const token = req.user;
    try {
      const profile = jwt.verify(token, process.env.JWT_SECRET); // 우리 jwt secret key
      const email = profile.email;
      console.log("프로필: ", profile);
      console.log("이메일: ", email);

      // // 사용자 데이터베이스에서 해당 이메일 검색
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        // 사용자가 데이터베이스에 없다면 회원가입
        const newUser = new User({ email, password: "", oauth: true });
        await newUser.save();
      } else if (existingUser.oauth === false) {
        // 이미 일반 이메일 가입한 회원인 경우
        res.redirect(
          `http://localhost:3000/auth/google/callback?userExists=true`
        );
      }
      res.redirect(`http://localhost:3000/auth/google/callback?token=${token}`);
    } catch (error) {
      console.error(error);
      res.redirect("/error");
    }
  }
);

module.exports = router;
