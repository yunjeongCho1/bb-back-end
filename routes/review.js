const express = require("express");
const router = express.Router();

const Review = require("../schema/reviewschema");

// review save
router.post("/new", async (req, res) => {
  try {
    const { book, rating, text, date } = req.body;
    const newReview = new Review({ book, rating, text, date });
    await newReview.save();

    console.log("Review saved successfully:", newReview);
    res.status(200).send("Review saved successfully");
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Error");
  }
});

// review load
router.get("/list", async (req, res) => {
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
    console.log("!!!!!", req.query.sort);
    //console.log("review get:", reviews);
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error load reviews: ", error);
    res.status(500).send("Error load review");
  }
});

//특정 review(id) load
router.get("/detail/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    const del_review = await Review.findByIdAndDelete(id);
    console.log(del_review);
    res.status(200).json(del_review);
  } catch (error) {
    console.error("Error delete : ", error);
    res.status(500).send("Error delete");
  }
});

//특정 review 수정
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    const up_review = await Review.findByIdAndUpdate(id, {
      rating: rating,
      text: text,
    });
    console.log(up_review);
    res.status(200).json(up_review);
  } catch (error) {
    console.error("Error update : ", error);
    res.status(500).send("Error update");
  }
});
module.exports = router;
