const express = require('express')
var bodyParser = require('body-parser')
const app = express()

var jsonParser = bodyParser.json()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/analyze', jsonParser, function(req,res) {
  console.log(req.body);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
