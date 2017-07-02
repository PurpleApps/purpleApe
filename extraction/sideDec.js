#!/usr/bin/env node

var fileName = process.argv[2];

var fs = require('fs');

fs.readFile("/vagrant/import/" + fileName, 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);

  if(obj.Appellant.indexOf("MR") > -1 || obj.Appellant.indexOf("MRS") > -1 || obj.Appellant.indexOf("DR") > -1 || obj.Appellant.indexOf("MS") > -1)
  {
    console.log("respondent");
  }
  else
  {
    console.log("appellant");
  }
});
