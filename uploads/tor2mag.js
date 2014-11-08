var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')




getHTML('http://search.tor2mag.com/api.php?apikey=k92Dkvh1n2d&keyword=ubuntu', function(html){
	console.log(html)
})

function getHTML(url, callback) 
{
    var req = http.get(url, function (res) {
        var bufferHelper = new BufferHelper();
        // res.setEncoding('utf8');
        var html = ''
        res.on('data', function (chunk) {
            bufferHelper.concat(chunk);
            // html += chunk;
        });

        res.on('end', function (chunk) {
            var html= iconv.decode(bufferHelper.toBuffer(),'utf8');
            //console.log(html)
            callback(html);
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message, url);
        //callback(null);
        getHTML(url, callback);
    });

    req.end();
}