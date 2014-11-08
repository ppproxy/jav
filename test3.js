
var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')

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
            var html= iconv.decode(bufferHelper.toBuffer(),'GBK');
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

            setTimeout(function(){

                var stats = fs.statSync(download_path + name);

                if( stats.size < 10000 ){
                    console.log('size-----', download_path + name)
                    console.log('size-----', file_url)
                    fs.unlink(download_path + "\\" + name)
                    return callback()
                }

                callback(name)
            },10)
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
        callback()
    });
}


function getPageList(url, done)
{
    getHTML(url, function(html)
    {

        var $ = cheerio.load(html);
        var items = $('.folder a')

        var list= []
        items.each(function(item){
            console.log('http://www.sis001.com/forum/'+this.attribs.href)
            // if($(this).find('a')[0].attribs)
            // list.push($(this).find('a')[0].attribs.href)
        })

        // done(list)
    })
}


function getPageInfo(url, done)
{
    getHTML(url, function(html)
    {
        // var $ = cheerio.load(html);
        // console.log($('.postcontent  .t_msgfont').html())
        var data = {}
        var rec 
        // 【影片名称】：下着モデルをさせられて… 
        html = html.replace(/</g, '\n<')
        // conso
        rec = html.match(/【影片名称】：(.*)/)

        if( rec )
            data.title = rec[1].trim()


        rec = html.match(/【上架时间】：(.*)/)

        if( rec )
            data.date = rec[1].trim()

        rec = html.match(/【影片時間】：(.*)/)

        if( rec )
            data.movieTime = rec[1].trim()

        rec = html.match(/【影片格式】：(.*)/)

        if( rec )
            data.plearType = rec[1].trim()

        rec = html.match(/【特 征 码】：(.*)/)

        if( rec ){
            if(rec[1].match(/[\d\w]{40,40}/))
            data.btcode = rec[1].match(/[\d\w]{40,40}/)[0].trim()
        }

        rec = html.match(/<title>(.*)/)

        if( rec )
        {
            var index = rec[1].lastIndexOf('- Asia Censored Section')
            data.name = rec[1].substring(0, index).trim()

            if( data.name.match(/[a-zA-Z]{2,10}[-]?[\d]{2,10}/) ){
                data.code = data.name.match(/[a-zA-Z]{2,10}[-]?[\d]{2,10}/)[0]
                var before = (/[a-zA-Z]{2,10}/.exec(data.code)+'').toUpperCase()
                var after = /[0-9]{2,10}/.exec(data.code)
                
                data.code = before+'-'+after
            }
        }

        rec = html.match(/attachment.php?aid=(.*)/)
        console.log(rec)
        if(rec){
            data.btNumber = rec[0]
        }


        //console.log(html.match(/【特 征 码】(.*)/)[1].match(/[\d\w]{40,40}/))
        console.log(data)
    })
}

getPageInfo('http://www.sis001.com/forum/thread-9200496-1-1.html', function(){

})

// getPageList('http://www.sis001.com/forum/forum-230-1512.html', function(){



// })
// getHTML('http://www.sis001.com/forum/forum-230-2.html', function(html){
//     console.log(html)
// })


// var options = {
//     hostname: 'www.sis001.com',
//     port: 80,
//     path: '/forum/attachment.php?aid=2505074',
//     method: 'GET'
// };
// // http://www.sis001.com/forum/attachment.php?aid=914697
// var req = http.get(options, function (res) 
// {
//     res.setEncoding('utf8');
// // res.setEncoding('binary')
//     for(i in res)
//         console.log(i)

//     var name  = res.headers['content-disposition'].match(/filename="(.*).torrent"/)[1]

//     // var bufferHelper = new BufferHelper();
//     // bufferHelper.concat(name);
//     // name= iconv.decode(bufferHelper.toBuffer(),'utf8');

//     console.log(res.headers)

//     var file = fs.createWriteStream('F://'+name+'.torrent');

//     res.on('data', function (data) {
//         file.write(data);
//     }).on('end', function () {
//         file.end();
//         console.log('download success');
//     });
// });

// req.on('error', function (e) {
//     console.log( e)
// });