#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require( 'fs' );
var exclude = require('./excludeterm.js').exclusion;
var nano = require('nano')('http://localhost:5984');
nano.db.create('respondent');
nano.db.create('appellant');
nano.db.create('docStats');

var resp = nano.db.use('respondent');
var appe = nano.db.use('appellant');
var docStats = nano.db.use('docStats');

fs.readdir('/vagrant/import', function( err, files ) {
  processFile(files);
});
/*exec('/vagrant/extraction/split.sh /vagrant/to100txt/to100txt/*.txt', function(error, stdout, stderr) {

});*/

function processFile(files) {
  file = files.pop();
  if(file.indexOf('.json') > -1) {
    console.log(file);
    exec('/vagrant/extraction/sideDec.js '+file, function(error,side,stderr) {
      console.log(side);
      exec('/vagrant/extraction/split.sh /vagrant/import/'+file.replace('json','txt'), function(error, stdout, stderr) {
        if(fs.existsSync('/vagrant/import/'+file.replace('.json','_summary.txt')) && fs.existsSync('/vagrant/import/'+file.replace('.json','_conclusion.txt'))) {
          exec('/vagrant/extraction/positiveNegative.js '+file.replace('.json','_conclusion.txt'), function (error, outcome, error) {
            if(outcome.indexOf('unknow') > -1) {
              processFile(files);
              return;
            }
            else {
              if(outcome.indexOf('negative') > -1) {
                outcome = 'negative';
              } else {
                outcome = 'positive';
              }
            }
            console.log(outcome);
            exec('/opt/apache-opennlp-1.8.0/bin/opennlp SentenceDetector /vagrant/models/en-sent.bin < /vagrant/import/'+file.replace('.json','_summary.txt')+' | /opt/apache-opennlp-1.8.0/bin/opennlp TokenizerME /vagrant/models/en-token.bin | /opt/apache-opennlp-1.8.0/bin/opennlp POSTagger /vagrant/models/en-pos-maxent.bin | /opt/apache-opennlp-1.8.0/bin/opennlp ChunkerME /vagrant/models/en-chunker.bin', function(error, stdout, stderr) {
              var rawTerms = stdout.match(new RegExp('\\[[^\\]]+\\]', 'g'))
              var terms = [];
              for(i in rawTerms) {
                var valid = true;
                for(j in exclude) {
                  rawTerms[i] = rawTerms[i].replace(new RegExp('\\s[^\\s]+'+exclude[j],'g'), '');
                }
                if(rawTerms[i].indexOf('_') > -1) {
                  terms.push(rawTerms[i]);
                }
              }
              terms = Array.from(new Set(terms));
              console.log(outcome);
              if(side.indexOf('respondent') > -1) {
                storeTerms(resp, terms, outcome, files);
              } else {
                storeTerms(appe, terms, outcome, files);
              }
              docStats.get('docStat', function(err, body) {
                var w = 0;
                var l = 0;
                if(!err) {
                  w = body.wins;
                  l = body.losses;
                }
                if(outcome.indexOf('positive')) {
                  w = w+1;
                } else {
                  l = l+1;
                }
                docStats.insert({_id: 'docStat', wins: w, losses: l}, function(err, body){});
              });
              processFile(files);
            });
          });
        } else processFile(files);
      });
    });
  /*
  */
} else processFile(files);

}

function storeTerms(db, terms, loutcome) {
  if(terms.length == 0){
    return;
  }
  var term = terms.pop().replace('[','').replace(']','').replace(' ','');
    db.get(term,{ include_docs: true}, function(err, body){
      var d = {_id: term, wins: 0, losses: 0};
      if(!err) {
        d.wins = body.wins;
        d.losses = body.losses;
        d._rev = body._rev;
        d._id = body._id;
      }
      if(loutcome.indexOf('positive')) {
        d.wins = d.wins+1;
      } else {
        d.losses = d.losses+1;
      }
      db.insert(d, function(err, body){
        if(err)
          console.log(err);
        storeTerms(db, terms, loutcome)
      });
    });
}
