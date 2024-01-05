const express = require("express");
const router = express.Router();
const axios = require("axios");

require("dotenv").config();
var api_key = process.env.API_KEY;

//베스트셀러 best
router.get("/recommend", async (req, res) => {
  //console.log(req.params);
  try {
    const api_url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${api_key}&start=${req.query.page}&MaxResults=50&QueryType=Bestseller&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;
    const response = await axios.get(api_url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const api_url = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${api_key}&itemIdType=ISBN13&ItemId=${req.params.id}&Cover=Big&output=js&Version=20131101`;
    const response = await axios.get(api_url);
    console.log(response.data.item);
    if (!response.data.item) {
      const new_url = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${api_key}&itemIdType=ISBN&ItemId=${req.params.id}&Cover=Big&output=js&Version=20131101`;
      const response = await axios.get(new_url);
      return res.status(200).json(response.data.item[0]);
    }

    res.status(200).json(response.data.item[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
module.exports = router;
