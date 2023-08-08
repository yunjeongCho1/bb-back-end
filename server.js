const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.json());
var cors = require("cors");
app.use(cors());

//routes
const userRouter = require("./routes/user");
const reviewRouter = require("./routes/review");
const searchRouter = require("./routes/search");
const bookRouter = require("./routes/book");
app.use("/api/user", userRouter);
app.use("/api/review", reviewRouter);
app.use("/api/search", searchRouter);
app.use("/api/book", bookRouter);

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
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 포트 8000번 연결
app.listen(8000, function () {
  console.log("port 8000 success");
});
