const express = require('express')
const app = express()
// const path = require('path')

app.use(express.json());
var cors = require('cors');
app.use(cors());


//mongodb 연결
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
  var api_key = process.env.API_KEY
  
  app.get('/api/search/book', function (req, res) {
    var api_url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${api_key}&Query=${encodeURI(req.query.query)}&QueryType=Title&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;
    var request = require('request');
    var options = {
      url: api_url,
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


// DB 

// Review model 정의
const reviewSchema = new mongoose.Schema({
  book: {
    isbn: String,
    title: String,
    author: String,
    publisher: String,
    image: String
  },
  rating: Number,
  text: String,
  date: Date
},{versionKey: false});

const Review = mongoose.model('Review', reviewSchema);

// review save
app.post('/api/review/new', async (req, res) => {
  try {
    const { book, rating, text, date } = req.body;
    const newReview = new Review({ book, rating, text, date });
    await newReview.save();
    
    console.log('Review saved successfully:', newReview);
    res.status(201).send('Review saved successfully');
  } catch (error) {
    console.error('Error', error);
    res.status(500).send('Error');
  }
});

// review load
app.get('/api/reviews', async(req, res) => {
  try{
    const reviews = await Review.find();
    console.log('review get:', reviews);
    res.status(200).json(reviews);
  } catch(error){
    console.error('Error load reviews: ', error);
    res.status(500).send('Error load review');
  }
});

//특정 review(id) load
app.get('/api/review/detail/:id', async(req, res) => {
  try{
    const {id} = req.params;
    //console.log(req.params);
    const id_review = await Review.findById(id);
    //console.log(id_review);
    res.status(200).json(id_review)
  } catch(error){
    console.error('Error load id: ', error);
    res.status(500).send('Error load id');
  }
});

//특정 review delete
app.delete('/api/review/:id', async (req, res) => {
  try{
    const {id} = req.params;
    console.log(req.params);
    const del_review = await Review.findByIdAndDelete(id);
    console.log(del_review);
    res.status(200).json(del_review)
  } catch(error){
    console.error('Error delete : ', error);
    res.status(500).send('Error delete');
  }
});

//특정 review 수정
app.put('/api/review/:id', async (req, res) => {
  try{
    const {id} = req.params;
    const {rating, text} = req.body;
    const up_review = await Review.findByIdAndUpdate(id, {
      rating: rating,
      text: text,
    });
    console.log(up_review);
    res.status(200).json(up_review)
  } catch(error){
    console.error('Error update : ', error);
    res.status(500).send('Error update');
  }
});

app.listen(8000, function () {
  console.log('port 8000 success')
});