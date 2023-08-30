const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.json());
var cors = require("cors");
app.use(
  cors({
    origin: "https://bookbook-phi.vercel.app", // 접근 권한을 부여하는 도메인
    credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
    optionsSuccessStatus: 200, // 응답 상태 200으로 설정
  })
);
//app.use(cors());

const jwt = require("jsonwebtoken");

require("dotenv").config();
var secret_key = process.env.SECRET_KEY;

//routes
const userRouter = require("./routes/user");
const reviewRouter = require("./routes/review");
const searchRouter = require("./routes/search");
const bookRouter = require("./routes/book");
const likeRouter = require("./routes/like");
const recommendRouter = require("./routes/recommend");

app.use("/api/user", userRouter);
app.use("/api/review", reviewRouter);
app.use("/api/search", searchRouter);
app.use("/api/book", bookRouter);
app.use("/api/like", likeRouter);
app.use("/api/recommend", recommendRouter);

//mongodb 연결
const mongoose = require("mongoose");
const dbAddress =
  "mongodb+srv://yjcho0907:7J9THy4qUK2x7KzO@cluster0.pnhtlwo.mongodb.net/?retryWrites=true&w=majority";
mongoose.set("strictQuery", true);
mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected" + "\n" + "---------------------"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/verify-token", (req, res) => {
  const token = req.headers.authorization;
  console.log("server.js: token o");

  if (!token) {
    return res.json({ valid: false });
  }

  jwt.verify(token.split(" ")[1], secret_key, (err, decoded) => {
    if (err) {
      return res.json({ valid: false });
    }
    // Token is valid
    return res.json({ valid: true });
  });
});

// 포트 8000번 연결
app.listen(8000, function () {
  console.log("port 8000 success");
});
