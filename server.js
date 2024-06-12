const express = require("express");
const app = express();
const cors = require("cors");
const compression = require("compression");

app.use(compression());
app.use(express.json());

app.use(cors());

const jwt = require("jsonwebtoken");

require("dotenv").config();

//routes
const userRouter = require("./routes/user");
const reviewRouter = require("./routes/review");
const searchRouter = require("./routes/search");
const bookRouter = require("./routes/book");
const likeRouter = require("./routes/like");
const recommendRouter = require("./routes/recommend");
const certificationRouter = require("./routes/certification");
const googleAuthRouter = require("./routes/googleAuth");

app.use("/auth", googleAuthRouter);
app.use("/api/certification", certificationRouter);
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

// 포트 8000번 연결
app.listen(8000, function () {
  console.log("port 8000 success");
});

//0613
