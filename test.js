const express = require('express')
const app = express()
const bodyParser = require('body-parser');

// const path = require('path')
app.use(bodyParser.json());
app.use(express.json());
var cors = require('cors');
app.use(cors());

//mongodb
mongoose = require("mongoose");
const dbAddress = "mongodb+srv://yjcho0907:7J9THy4qUK2x7KzO@cluster0.pnhtlwo.mongodb.net/?retryWrites=true&w=majority";
mongoose.set('strictQuery', true);
mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
require('dotenv').config();
var client_id = process.env.API_CLIENT_ID
var client_secret = process.env.API_CLIENT_SECRET

//api(naver open api)
app.get('/search/book', function (req, res) {
  var api_url = 'https://openapi.naver.com/v1/search/book?query=' + encodeURI(req.query.query);
  var request = require('request');
  var options = {
    url: api_url,
    headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  });
});

// 데이터베이스 schema 정의
const ReviewSchema = new mongoose.Schema({
  isbn: String,
  title: String,
  author: String,
  publisher: String,
  image: String,
  text: String,
  date: String,
});

const Review = mongoose.model("Review", ReviewSchema);

//collection 생성(test > reviews document에 저장되어있음.)
const review = new Review({
  isbn: "9791187033882",
  title: "망그러진 만화",
  author: "유랑",
  publisher: "좋은생각",
  image: "https://shopping-phinf.pstatic.net/main_3527242/35272422624.20221229074357.jpg",
  text: "ㅎㅎㅎㅎㅎㅎㅎ",
  date: "2023년 7월 27일 목요일",
});

review.save()
.then(()=>{
  console.log("mongodb에 저장 성공")
})
.catch((err)=>{
  console.error(err)
})

Review.find({author: '유랑'}).then((docs) => {
  console.log(docs)
})

//review load (post 요청)
app.post('/', function (req, res) {
  console.log(req.body);
  res.send(req.body)
})

app.listen(8000, function () {
  console.log('success')
});

