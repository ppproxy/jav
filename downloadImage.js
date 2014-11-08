var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')

var ObjectID = require('mongoskin').ObjectID;
var count = 0

// Movie.dbColl.count({image_exists: true}, function(err, _count){
//     count += _count
// })
// Movie.update({}, {image_exists:false}, function(){
//     console.log('ok')
// })
// return

// Movie.dbColl.count({image_exists: false}, function(err, count){
//     console.log(count)
// })
// return
var index = -1
// return
function start(num, done)
{
    var ObjectID = require('mongoskin').ObjectID;
    
    // var ids = require('./ids2.json')

    // // console.log(ids)
    // var list = []
    // for(var key in ids)
    //     list.push(ObjectID(key))

    // Movie.dbColl.find({ _id: {$in: list}}).sort({code: -1}).limit(100).toArray(function(err, docs){
    //     res.render('page/page', { docs: docs, count: count/30, page: page, begin: begin, end: end, search: req.params.search })
    //     // console.log(doc)
    // })
    // if(num<1200)
    //     return start(++index)
    // return
    //image_exists:true date: { $gt: ' 2014-10-01' }
    Movie.dbColl.find({ image_exists: { $ne: true } }).sort({date: -1}).limit(100).skip(num * 100).toArray(function(err, docs)
    // Movie.dbColl.find({ _id: {$in: list}}).sort({code: -1}).limit(30).skip(num * 30).toArray(function(err, docs)
    {
        if(!docs.length)
            return
        var taskList = []
        // console.log(docs.length)
        docs.forEach(function(doc)
        {
            taskList.push(function(done)
            {
                // doc.images.forEach(function(image, index)
                // {
                    var taskList = []

                    taskList.push(function(done)
                    {
                        if( fs.existsSync('./public/images/avimage/' + doc.code+'.jpg') ){
                            // console.log('-----exists', doc.code)
                            return done(true)
                        }

                        downloadFile('./public/images/avimage/', doc.poster, doc.code, function (err, name) 
                        {
                            console.log(name)
                            if( !err )
                                Movie.updateById(doc._id, { image_exists: true })
                            else if( err === 1 )
                                Movie.updateById(doc._id, { image_exists: 'min' })
                            else
                                Movie.updateById(doc._id, { image_exists: 'err' })

                            done(!name)
                        });
                    })

                    async.series(taskList, function(err){
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
// start(++index)
// start(++index)

var url = 'http://pics.dmm.co.jp/mono/movie/adult/jux337/jux337pl.jpg'

function downloadFile(download_path, file_url, fileName, callback) 
{
    if (!file_url) {
        return callback();
    }

    var date = new Date();
    var index = file_url.lastIndexOf('.');

    var name = fileName + file_url.substring(index, file_url.length);
    name = name.substring(0, name.lastIndexOf('.jpg') + 4)

    var file = fs.createWriteStream(download_path + name);
    var req = http.get(file_url, function (res) {
        res.on('data', function (data) {
            file.write(data);
        }).on('end', function () {
            file.end();

            // setTimeout(function(){

                var stats = fs.statSync(download_path + name);

                if( stats.size < 1000 ){
                    // console.log('size-----', download_path + name)
                    // console.log('size-----', file_url)
                    fs.unlink(download_path + name)
                    return callback(1)
                }

                callback(null, name)
            // },10)
            //console.log('download success');
        });
    });

    req.on('error', function (e) {
        console.log( e)
        try {
            file.end();
            fs.unlink(download_path + name)
            console.log('problem with request: ' + download_path + name);
        } catch (e) {
            console.log( e)
        }
        callback(e)
    });
}