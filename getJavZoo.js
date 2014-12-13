var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')
var toolUrl = require('url')

function getHTML(url, callback) 
{
	var urlObj = toolUrl.parse(url)

	var options = {
	    hostname: urlObj.host,
	    port: 80,
	    headers: {

			'Cookie':'HstCfa2608280=1405185342330; HstCmu2608280=1412796297214; __atuvc=0%7C37%2C0%7C38%2C0%7C39%2C0%7C40%2C31%7C41; view=70; HstCla2608280=1412869451122; HstPn2608280=11; HstPt2608280=78; HstCnv2608280=3; HstCns2608280=6'
		
			, 'Host':'www.javzoo.com'
			, 'If-Modified-Since':'Thu, 09 Oct 2014 18:13:37 GMT'
			, 'Proxy-Connection':'keep-alive'
			, 'User-Agent':'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36'
	    },
	    path: urlObj.path,
	    method: 'GET'
	};

    var req = http.get(options, function (res) {
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
        // console.log('problem with request: ' + e.message, url);
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
        try{
        	data.poster = ($('.bigImage img')[0].attribs.src)
        }
        catch(e){
        	// getPageInfo(url,done)
        	// console.log(html)
        	return done(null)
        }

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
        // console.log(html)
        done(list)
    })
}

// getPageInfo('http://www.jav28.com/cn/movie/YTR-071',function(){

// })

var list = []
for(var i =1;i<5000;i++)
{
    list.push('http://www.javzoo.com/cn/released/currentPage/'+i)
}
var task = []
var map = {}    
var updateCount = 0
var createCount = 0
list.forEach(function(burl)
{
    task.push(function(done)
    {
        if( map[ burl ] )
            return done()

        // console.log(burl)

        map[ burl ] = true
        History.findOne({ url: burl }, function(err, doc)
        {
            if( doc ){
                // console.log('------', burl)
                // return done()
            }
            getPageList(burl, function(list)
            {
            	// console.log(list)
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
                                // console.log('------', burl)
                                return done()
                            }

                            getPageInfo(url, function(info)
                            {
                            	// console.log(info)
                            	if( !info )
                            		return done()

                                Movie.findOne({ code: info.code }, function(err, doc)
                                {
                                    if( !doc ){
                                        console.log('create', info.code, createCount++, burl)
                                        info.provider = 'javzoo'
                                        info.lastUpdate = new Date()
                                        Movie.create(info, function(){

                                        })
                                    }
                                    else{
                                        // if( info.provider === 'javzoo')
                                        //     return;

                                    	console.log('update', info.code, updateCount++, burl)
                                    	Movie.updateById(doc._id, { images: info.images, provider: 'javzoo', poster: info.poster }, function(){

                                        })
                                    }
                                })
                                
                                History.create({ url: url }, function(){
                                    done()
                                })
                            })
                        })
                    })
                })
                
                async.series(taskList, function(){
                    History.create({ url: burl }, function(){
                        done()
                    })
                    // console.log(burl, 'is done')

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

// getHTML(options, function(html){
// 	console.log(html)
// })

// function getHTML(url, callback) 
// {
//     var req = http.get(url, function (res) {
//         var bufferHelper = new BufferHelper();
//         // res.setEncoding('utf8');
//         var html = ''
//         res.on('data', function (chunk) {
//             bufferHelper.concat(chunk);
//             // html += chunk;
//         });

//         res.on('end', function (chunk) {
//             var html= iconv.decode(bufferHelper.toBuffer(),'utf8');
//             //console.log(html)
//             callback(html);
//         });
//     });

//     req.on('error', function (e) {
//         console.log('problem with request: ' + e.message, url);
//         //callback(null);
//         getHTML(url, callback);
//     });

//     req.end();
// }
