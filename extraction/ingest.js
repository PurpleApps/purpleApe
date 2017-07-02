#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require( 'fs' );
var exclude = require('./excludeterm.js').exclusion;
var nano = require('nano')('http://localhost:5984');
nano.db.create('respondent');
nano.db.create('appellant');
var resp = nano.db.use('respondent');
var appe = nano.db.use('appellant');
nano.db.create('docStats');
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
              if(side.indexOf('respondent') > -1) {
                for(i in terms) {
                  resp.get(terms[i], function(err, body){
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
                    resp.insert({_id: terms[i], wins: w, losses: l}, function(err, body){});
                  });
                }
              } else {
                for(i in terms) {
                  resp.get(terms[i], function(err, body){
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
                    resp.insert({_id: terms[i], wins: w, losses: l}, function(err, body){});
                  });
                }
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
                processFile(files);
              });
            });
          });
        }
      });
    });
  /*
  */
} else processFile(files);

}
