const express = require("express");
const app = express();
const port = 8000;

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const dbAddress = "mongodb+srv://yjcho0907:7J9THy4qUK2x7KzO@cluster0.pnhtlwo.mongodb.net/?retryWrites=true&w=majority";
mongoose.set('strictQuery', true);
mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
  
app.get("/", (req, res) => res.send("Hello world!!!!"));

app.listen(port, () => console.log(`listening on port ${port}`));