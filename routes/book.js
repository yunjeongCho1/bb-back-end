const express = require("express");
const router = express.Router();

require("dotenv").config();
var api_key = process.env.API_KEY;

router.get("/recommend", function (req, res) {
  console.log(req.params);
  var api_url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${api_key}&start=${req.query.page}&MaxResults=50&QueryType=Bestseller&Cover=Big&SearchTarget=Book&output=js&Version=20131101`;
  var request = require("request");
  var options = {
    url: api_url,
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});
router.get("/detail/:id", function (req, res) {
  var api_url = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${api_key}&itemIdType=ISBN13&ItemId=${req.params.id}&Cover=Big&output=js&Version=20131101`;
  var request = require("request");
  var options = {
    url: api_url,
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
      res.end(body);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});
module.exports = router;
