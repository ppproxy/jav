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
            html += chunk;
        });

        res.on('end', function (chunk) {
            // var html= iconv.decode(bufferHelper.toBuffer(),'GBK');
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

// getHTML('http://www.jav28.com/cn/', function(html){
//     console.log(html)
// })

function getPageInfo(url, done)
{
    getHTML(url, function(html)
    {
        var $ = cheerio.load(html);
        var title = $('.row-fluid h3')
        var data = {}
        if($(title)[0] && $(title)[0].children[0])
            data.title = $(title)[0].children[0].data

        var info = $('.movie .info').children()

        // console.log('++',url)
        if( $('.bigImage img')[0] )
        data.poster = ($('.bigImage img')[0].attribs.src)

        if( $(info[0]).find('span')[1] && $(info[0]).find('span')[1].children[0] )
            data.code = $(info[0]).find('span')[1].children[0].data

        if( $(info[1]).children()[0] && $(info[1]).children()[0].next )
            data.date = $(info[1]).children()[0].next.data

        if( $(info[2]).children()[0] && $(info[2]).children()[0].next )
            data.movieTime = $(info[2]).children()[0].next.data

        if( $(info[4]).children()[0] && $(info[4]).children()[0].children[0] )
            data.produce = $(info[4]).children()[0].children[0].data

        if( $(info[6]).children()[0] && $(info[6]).children()[0].children[0] )
            data.publisher = $(info[6]).children()[0].children[0].data
        
        if( $(info[8]).children()[0] && $(info[8]).children()[0].children[0] )
            data.director = $(info[8]).children()[0].children[0].data

        if( $(info[10]).children()[0] && $(info[10]).children()[0].children )
        {
            $(info[10]).children().each(function(item){
                data.cast = data.cast || []
                if(this.children[0].children[0])
                    data.cast.push(this.children[0].children[0].data)
            })
        }

        if( $(info[12]).children()[0] && $(info[12]).children()[0].children )
        {
            $(info[12]).children().each(function(item){
                data.tags = data.tags || []
                if(this.children[0].children[0])
                    data.tags.push(this.children[0].children[0].data)
            })
        }

        if( $('.container .sample-box li') )
        {
            $('.container .sample-box li').each(function(){
                data.images = data.images || []
                data.images.push($(this).find('img')[0].attribs.src)
            })
        }

        done(data)
    })
}



// getPageList('http://www.jav28.com/cn/1')
function getPageList(url, done)
{
    getHTML(url, function(html)
    {

        var $ = cheerio.load(html);
        var items = $('#waterfall').children()

        var list= []
        items.each(function(item){
            if($(this).find('a')[0].attribs)
            list.push($(this).find('a')[0].attribs.href)
        })

        done(list)
    })
}


var list = []
for(var i =1;i<100;i++)
{
    list.push('http://www.jav28.com/cn/'+i)
}
var task = []
var map = {}

list.forEach(function(burl)
{
    task.push(function(done)
    {
        if( map[ burl ] )
            return done()

        console.log(burl)

        map[ burl ] = true
        History.findOne({ url: burl }, function(err, doc)
        {
            if( doc ){
                console.log('------', burl)
                // return done()
            }

            getPageList(burl, function(list)
            {
                var time1 = 1
                var taskList = []
                // list= [list[0]]
                list.forEach(function(url)
                {
                    taskList.push(function(done)
                    {
                        History.findOne({ url: url }, function(err, doc)
                        {
                            if( doc ){
                                console.log('------', burl)
                                // return done()
                            }


                            getPageInfo(url, function(info)
                            {
                                // list.forEach(function(rec)
                                // {
                                    // console.log(info)
                                    Movie.findOne({ code: info.code }, function(err, doc)
                                    {
                                        if( !doc  ){

                                            info.lastUpdate = new Date()
                                            console.log('create', info.code, info.date)
                                            info.provider = 'jav28'
                                            Movie.create(info, function(){

                                            })
                                        }
                                        else{
                                            // console.log('update', rec.code)
                                            // Movie.updateById(doc._id, rec, function(){

                                            // })
                                        }
                                    })
                                    // Movie.create(rec, function(){

                                    // })
                                // })
                                
                                History.create({ url: url }, function(){
                                    done()
                                })
                            })
                        })
                    })
                })
                
                async.parallel(taskList, function(){
                    History.create({ url: burl }, function(){
                        done()
                    })
                    console.log(burl, 'is done')

                })
                // getPage('http://we.99btgc.com/p2p/06/14-05-31-20-04-47.html')
            })
        })
    })
})

console.log(task.length)
async.series(task, function(){
    console.log('all is done')
})
async.series(task, function(){
    console.log('all is done')
})

async.series(task, function(){
    console.log('all is done')
})

async.series(task, function(){
    console.log('all is done')
})

async.series(task, function(){
    console.log('all is done')
})

// <a href="http://www.jav28.com/cn/movie/YTR-071" target="_blank"><img src="http://pics.dmm.co.jp/mono/movie/adult/h_127ytr071/h_127ytr071ps.jpg" class="img"></a>
