const express = require("express");

const app = express();

const port = 9000;

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Hello world!!!!"));

app.listen(port, () => console.log(`listening on port ${port}`));