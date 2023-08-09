const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Review = require("../schema/reviewschema");

// review save/write
router.post("/new", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);

    const user = await User.findById(decoded._id);
    const { book, rating, text, date } = req.body;

    const newReview = new Review({
      book,
      rating,
      text,
      date,
      user_id: user._id,
    });
    await newReview.save();

    console.log("Review saved successfully:", newReview);
    res.status(200).send("Review saved successfully");
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

// review load
router.get("/list", authMiddleware, async (req, res) => {
  try {
    let reviews = await Review.find().sort({ date: -1 });

    if (req.query.sort === "title") {
      reviews.sort((a, b) => a.book.title.localeCompare(b.book.title));
      // } else if (req.query.sort === "title") {
      //   reviews.sort((a, b) => b.book.title.localeCompare(a.book.title));
      // }
    }

    if (req.query.sort === "date_asc") {
      reviews = reviews.reverse();
    }
    console.log("review.js_sort: ", req.query.sort, "\n" + "-----------------");
    //console.log("review get:", reviews);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error load reviews: ", error);
    res.status(500).send("Error load review");
  }
});

//특정 review(id) load
router.get("/detail/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    //console.log(req.params);
    const id_review = await Review.findById(id);
    //console.log(id_review);
    res.status(200).json(id_review);
  } catch (error) {
    console.error("Error load id: ", error);
    res.status(500).send("Error load id");
  }
});

//특정 review delete
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);

    const review = await Review.findById(id);
    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);

    if (user._id === review.user_id) {
      const del_review = await Review.findByIdAndDelete(id);
      console.log(del_review);
      res.status(200).json(del_review);
    }
  } catch (error) {
    console.error("Error delete : ", error);
    res.status(500).send("Error delete");
  }
});

//특정 review 수정
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    const review = await Review.findById(id);

    const token = req.headers.authorization;
    const decoded = jwt.verify(token.split(" ")[1], secret_key);
    const user = await User.findById(decoded._id);
    if (user._id === review.user_id) {
      const up_review = await Review.findByIdAndUpdate(id, {
        rating: rating,
        text: text,
      });
      console.log(up_review);
      res.status(200).json(up_review);
    }
  } catch (error) {
    console.error("Error update : ", error);
    res.status(500).send("Error update");
  }
});
module.exports = router;
