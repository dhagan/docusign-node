/**
 * Created by dhagan on 9/19/2014.
 */
//
// to run this sample
//  1. copy the file in your own directory - say, example.js
//  2. change "***" to appropriate values
//  3. install async and request packages
//     npm install async
//     npm install request
//  4. execute
//     node example.js
//

var async = require("async");		// async module
var _ = require('underscore');
var simpleSqlParser = require('simple-sql-parser');
//var parse = require('csv-parse');
var csv = require('ya-csv');

var array = [];
var csvArray = {};
var outArray = [];

async.waterfall(
    [

        function (next) {
            var fs = require('fs');
            var file = __dirname + '/countries.sql';

            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }

                array = data.toString().split("\n");
                for (i in array) {
                    //console.log(array[i]);
                }
                next(null);
            });
        },


        function (next) {
            var file = __dirname + '/AttachmentA.csv';
            // equivalent of csv.createCsvFileReader('AttachmentA.csv')
            var reader = csv.createCsvFileReader(file, {
                'separator': ',',
                'quote': '"',
                'escape': '"',
                'comment': ''
            });
            //writer = new csv.CsvWriter(process.stdout);
            reader.addListener('data', function (data) {
                csvArray[data[0]] = ([ data]);
            });

            reader.addListener('end', function (data) {
                next(null);
            });

        },

        function (next) {
            console.log(simpleSqlParser.sql2ast(array[0]));
            array = _.map(array, function (item) {
                return simpleSqlParser.sql2ast(item);
            });
            console.log(array[1]);
            next(null);
        },

        function (next) {
            _.each(array, function (item) {
                var sql = 'INSERT CountryOfOrigin (Name, Bigram, Trigram, Number, Compliant) values (' + item.VALUES[0][0] + ', ' + item.VALUES[0][1] + ', ' + item.VALUES[0][2] + ', ' + item.VALUES[0][3];
                var countryUpper = item.VALUES[0][0].replace(/'/g, "").toUpperCase();

                var _csvLine = csvArray[countryUpper];
                if (_csvLine == null) {
                    console.log(countryUpper);

                } else {
                    if (_csvLine[0][1] == 'YES') {
                        sql = sql + ', true )';
                    } else {
                        sql = sql + ', false)';
                    }

                    outArray.push(sql);
                }
            });
            next(null);
        },

        function (next) {
            var fs = require('fs');
            var fileName = __dirname + '/countryOut.sql';

            var file = fs.createWriteStream(fileName);
            file.on('error', function (err) { /* error handling */
            });
            _.each(outArray,
                function (item) {
                    file.write(item + '\n');
                });

            file.end();

            /*
             fs.writeFile(file,
             _.map(outArray, function (v) {
             return v + '\n';
             }),
             function (err) {
             if (err) {
             console.log(err);
             } else {
             console.log(file + " The file was saved!");
             }
             });
             */
        }
    ]);

