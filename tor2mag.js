var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')

// Movie.update({torrent: { $exists:true } }, { $set: {$unset: {'torrent': true }}}, function(){
//     console.log('ok')
// })
// return
var index = 0
var count = 0
function start(num, done)
{
    var ObjectID = require('mongoskin').ObjectID;
    
    Movie.dbColl.find({ seeds: { $exists: false }, no_seed: {$exists: false} }).sort({ date: -1 }).limit(100).skip(num * 100).toArray(function(err, docs)
    {
        if(!docs.length)
            return

        var taskList = []

        docs.forEach(function(doc)
        {
            taskList.push(function(done)
            {
                getHTML('http://search.tor2mag.com/api.php?apikey=k92Dkvh1n2d&keyword='+doc.code, function(html)
                {
                    var list = []
                    try{

                        var json = JSON.parse(html)
                        }

                    catch(e){
                        return done()
                    }
                    try
                    {
                        for( var i = 1; i <= json.total_found; i++ )
                        {
                            if( json[i] && new RegExp(doc.code).test(json[i].title)){
                                list.push(json[i])
                            }
                        }
                        if( list.length ){
                            console.log(list, count++)
                            Movie.update({ _id: doc._id }, { seeds: list },function(){})
                        }
                        else{
                            Movie.update({ _id: doc._id }, { no_seed: true },function(){})
                        }
                    }
                    catch(e){
                        console.log(json)
                    }
                    done()
                })
            })
        })
        
        async.series(taskList, function(){
            console.log('all ok', num)
            start(++index)
        })
    })
}
start(++index)
var code = 'DJMS-005'

// getHTML('http://search.tor2mag.com/api.php?apikey=k92Dkvh1n2d&keyword='+code, function(html)
//                 {
//                     console.log(html)
//                 })
function getHTML(url, callback) 
{
    var req = http.get(url, function (res) {
        var bufferHelper = new BufferHelper();
        // res.setEncoding('utf8');
        var html = ''
        res.on('data', function (chunk) {
            // bufferHelper.concat(chunk);
            html += chunk;
        });

        res.on('end', function (chunk) {
            // var html= iconv.decode(bufferHelper.toBuffer(),'utf8');
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