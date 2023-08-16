const mongoose = require("mongoose");

//Review schema
const reviewSchema = new mongoose.Schema(
  {
    book: {
      isbn: String,
      title: String,
      author: String,
      publisher: String,
      image: String,
    },
    rating: Number,
    text: String,
    user_id: String,
    date: Date,
    status: String,
  },
  { versionKey: false }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
