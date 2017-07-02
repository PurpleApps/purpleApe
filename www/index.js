const express = require('express')
var bodyParser = require('body-parser')
var exec = require('child_process').exec;
var exclude = require('../extraction/excludeterm.js').exclusion;
const app = express()
var nano = require('nano')('http://localhost:5984');

var resp = nano.db.use('respondent');
var appe = nano.db.use('appellant');

var jsonParser = bodyParser.json()

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/analyze', jsonParser, function(req,res) {
  console.log(req.body);
  exec('echo "'+req.body.text+'" | /opt/apache-opennlp-1.8.0/bin/opennlp SentenceDetector /vagrant/models/en-sent.bin | /opt/apache-opennlp-1.8.0/bin/opennlp TokenizerME /vagrant/models/en-token.bin | /opt/apache-opennlp-1.8.0/bin/opennlp POSTagger /vagrant/models/en-pos-maxent.bin | /opt/apache-opennlp-1.8.0/bin/opennlp ChunkerME /vagrant/models/en-chunker.bin', function(error, stdout, stderr) {
    var rawTerms = stdout.match(new RegExp('\\[[^\\]]+\\]', 'g'))
    var terms = [];
    for(i in rawTerms) {
      var valid = true;
      for(j in exclude) {
        rawTerms[i] = rawTerms[i].replace(new RegExp('\\s[^\\s]+'+exclude[j],'g'), '');
      }
      if(rawTerms[i].indexOf('_') > -1) {
        terms.push(rawTerms[i].replace('[','').replace(']','').replace(' ',''));
      }
    }
    terms = Array.from(new Set(terms));
    console.log(terms);
    var inv = false;
    if((req.body.resp == 'appealing' && req.body.emp == 'employer') || (req.body.resp == 'responding' && req.body.emp == 'employee'))
      inv = true;
    if(req.body.resp == 'appealing') {
      getTermResults(appe, terms, {wins: 0, losses: 0, topWins: [], topLosses: []}, res, inv);
    } else {
      getTermResults(resp, terms, {wins: 0, losses: 0, topWins: [], topLosses: []}, res, inv);
    }
  });
});

function getTermResults(db, terms, result, response, inv) {
  if(terms.length == 0){
    result.topWins.sort(customSort);
    result.topLosses.sort(customSort);
    result.percent = (result.wins * 1.0) / (result.losses * 1.0);
    if(inv) {
      var tmp = result.topWins;
      result.topWins = result.topLosses;
      result.topLosses = tmp;
      result.percent = 1-result.percent;
    }
    console.log(result);
    response.send(result);
    return;
  }
  var term = terms.pop();
  db.get(term,{ include_docs: true}, function(err, body){
    if(!err) {
      result.wins = result.wins + body.wins;
      result.losses = result.losses + body.losses;
      result.topWins.push({diff: body.wins - body.losses, term: body._id});
      result.topLosses.push({diff: body.losses - body.wins, term: body._id});
    }
    getTermResults(db, terms, result, response, inv);
  });
}

function customSort(a,b) {
  return  b.diff - a.diff;
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
