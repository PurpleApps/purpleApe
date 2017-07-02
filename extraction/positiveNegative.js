#!/usr/bin/env node

var fileName = process.argv[2];

var fs = require('fs');

var negativeResult = 0;
var positiveResult = 0;

fs.readFile("/vagrant/import/" + fileName, 'utf8', function (err, data) {
	if (err) {
		console.log(err);
	}
	else
	{
		if(data.indexOf("reject") > -1 ||
			data.indexOf("dismisses") > -1 ||
			data.indexOf("dismissed") > -1 ||
			data.indexOf("dismissing") > -1 ||
			data.indexOf("fails") > -1 ||
			data.indexOf("failed") > -1 ||
			data.indexOf("failing") > -1 ||
			data.indexOf("refuse") > -1 ||
			data.indexOf("refuses") > -1 ||
			data.indexOf("refused") > -1 ||
			data.indexOf("refusing") > -1 ||
			data.indexOf("reject") > -1 ||
			data.indexOf("rejects") > -1 ||
			data.indexOf("rejected") > -1 ||
			data.indexOf("rejecting") > -1 ||
			data.indexOf("cannot stand") > -1 ||
			data.indexOf("must fall") > -1 ||
			data.indexOf("not be remitted") > -1 ||
			data.indexOf("not remitted ") > -1 ||
			data.indexOf("decision will stand") > -1 ||
			data.indexOf("must fail") > -1 ||
			data.indexOf("is misconceived") > -1)
			{
				negativeResult = 1;
			}

			if(data.indexOf("remit") > -1 ||

				//data.indexOf("remitted") > -1 ||
				data.indexOf("remitting") > -1 ||
				data.indexOf("remission") > -1 ||
				data.indexOf("allow the appeal") > -1 ||
				data.indexOf("allow this appeal") > -1 ||
				data.indexOf("allowing the appeal") > -1 ||
				data.indexOf("allowing this appeal") > -1 ||
				data.indexOf("appeal is allowed") > -1 ||
				data.indexOf("appeal will be allowed") > -1 ||
				data.indexOf("claims are stayed") > -1 ||
				data.indexOf("appeal should be upheld") > -1 ||
				data.indexOf("appeal succeeds") > -1 ||
				data.indexOf("appeal is therefore allowed") > -1 ||
				data.indexOf("matter will have to be heard again") > -1 ||
				data.indexOf("matters back to the same") > -1 ||
				data.indexOf("did not err in law") > -1 ||
				data.indexOf("uphold the appeal") > -1 ||
				data.indexOf("uphold this appeal") > -1 ||
				data.indexOf("upholding the appeal") > -1 ||
				data.indexOf("upholding this appeal") > -1 ||
				data.indexOf("back for a rehearing") > -1)
				{
					positiveResult = 1;
				}

		if(negativeResult == 1 && positiveResult == 0) console.log("negative");

		if(positiveResult == 1 && negativeResult == 0) console.log("positive");

		if(negativeResult == positiveResult)
			console.log("unknown");


	}
});
