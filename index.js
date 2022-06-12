require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const url = require("url");
const { application } = require("express");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = /* process.env.PORT ||  */ 3000;

// Dictionary to keep track of shortened URLs
const urlDirectory = new Map();

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded());
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  let foundKey = undefined;
  for (let [key, value] of urlDirectory.entries()) {
    if (value === parseInt(req.params.shorturl)) {
      foundKey = key;
    }
  }
  if (foundKey !== undefined) {
    console.log(foundKey);
    res.redirect(foundKey);
  } else {
    res.json({
      error: "Shorturl not found",
    });
  }
});

app.post("/api/shorturl", (req, res) => {
  try {
    const lookupUrl = new url.URL(req.body.url);
    dns.lookup(lookupUrl.hostname, (err, address) => {
      if (err) {
        res.json({
          error: "invalid url",
        });
      }
      if (!urlDirectory.has(lookupUrl)) {
        urlDirectory.set(lookupUrl.href, urlDirectory.size + 1);
        res.json({
          original_url: lookupUrl.href,
          short_url: urlDirectory.get(lookupUrl.href),
        });
      }
    });
  } catch (error) {
    res.json({
      error: "invalid url",
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
