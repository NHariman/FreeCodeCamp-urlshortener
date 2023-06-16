require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(require('body-parser').urlencoded({extended: false}));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];

function ShortUrlData(fullUrl, shortUrl) {
  this.fullUrl = fullUrl;
  this.shortUrl = shortUrl;
}

const findFullUrlInDatabase = (findUrl) => {
  return urlDatabase.find(url => url.fullUrl === findUrl);
}

const findShortUrlInDatabase = (findUrl) => {
  return urlDatabase.find(url => url.shortUrl === parseInt(findUrl));
}

app.get("/api/shorturl/:shortUrl", function(req, res) {
  if (parseInt(req.params.shortUrl) === 0) {
    res.json({
      error: "Wrong format"
    });
  } else {
    let foundUrl = findShortUrlInDatabase(req.params.shortUrl);
    if (foundUrl === undefined) {
      res.json({
        error: "No short URL found for the given input"
      });
    } else {
      res.writeHead(301, { Location: foundUrl.fullUrl });
      res.end();
      // window.location.replace(foundUrl.fullUrl);
    }
  }
});

app.post("/api/shorturl", function(req, res){
  let foundUrl = findFullUrlInDatabase(req.body.url);
  if (foundUrl) {
    res.json({
      original_url: foundUrl.fullUrl,
      short_url: foundUrl.shortUrl
    });
  } else {
    if (dns.lookup(new URL(req.body.url).hostname, { all: true }, (err, address, family) => {
      if (err) {
        console.log(err);
        return res.json({
          error: "Invalid URL"
        });
      }
      let newDatabaseId = urlDatabase.length + 1;
      let newEntry = new ShortUrlData(req.body.url, newDatabaseId);
      urlDatabase.push(newEntry);
      console.log("urlDatabase: " + JSON.stringify(urlDatabase));
      console.log("new entry: " + JSON.stringify(newEntry));
      res.json({
        original_url: newEntry.fullUrl,
        short_url: newEntry.shortUrl
      });
    }));
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
