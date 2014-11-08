// http://www.javzoo.com/cn/released/currentPage/1

var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')

// Movie.update({}, { from : '99btgc'}, function(){
        
// })
    
// return
// Movie.find({  }, function(err, docs){
//     var map = {}
//     var list = []
//     // return console.log(docs.length)
//     docs.forEach(function(doc){

//         // if( map[doc.code_before.toUpperCase()] )
//         //     return
//         // console.log(doc.names.join(' '))
//         Movie.updateById(doc._id, { name: doc.names.join(' ') },function(){})

//         // map[doc.code_before.toUpperCase()] = true
//         // list.push(doc.code_before.toUpperCase())

//         // var name = doc.name.join('')
//         // var exec = /[a-zA-Z]{2,10}[-]?[\d]{2,10}/g.exec(name)
//         // if(exec ){
//         //     console.log(exec[0])
       
//         //     // console.log(exec.length)
//         // }
//         // else if( exec[0].length<5 )
//         //     console.log(doc.name[0])
//     })
//     console.log(list, list.length)
// })

// return
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

var pages = []

function getNextPage(url, done)
{
    getHTML(url, function(html)
    {
        var $ = cheerio.load(html);
        var links = $('#content').find('a')

        // console.log($(links[links.length-2]).attr('href'))
        var url = $(links[links.length-2]).attr('href')

        if( url )
        {
            url = 'http://we.99btgc.com'+ url
            pages.push(url)

            done(url)
            
        }
    })
}

function getPage(url, done)
{

    getHTML(url, function(html)
    {
        

        var $ = cheerio.load(html);
        var links = $('#content').children()

        var list = []
            , names = []
            , images = []
            , urls = []

        $('*').each(function()
        {
            if( this.prev && !this.prev.name && this.prev.data.length > 10 )
            {  
                var name = this.prev.data.replace(/\s/g, '')
                name = name.replace(/=/g, '')
                name = name.replace(/-/g, '')
                if( name )
                    names.push(name)
            }

            if( this.name==='img'){  
                if( this.attribs.src.indexOf('http://pics') > -1 ){
                    images.push(this.attribs.src)
                }
            }

            if( this.name==='a')
            {
                if( this.attribs.href.indexOf('.html') > -1 )
                {
                    urls.push(this.attribs.href)
                    
                    if( names.length && images.length && urls.length )
                    {
                        var json = {
                            names: names
                            , images: images
                            , urls: urls
                            , name_string: names.join(' ')
                            , name: names[0]
                        }

                        var name = names.join('')
                        var exec = /[a-zA-Z]{2,10}[-]?[\d]{2,10}/g.exec(name)
                        var exec2 = /[a-zA-Z]{1,10}[-]?[\d]{2,10}/g.exec(name)
                        if( exec ){
                            var before = (/[a-zA-Z]{2,10}/.exec(exec[0])[0]).toUpperCase()
                            var after = (/[0-9]{2,10}/.exec(exec[0])[0]).toUpperCase()
                            json.code_before = before
                            json.code_after = after
                            json.code = before+'-'+after
                            
                        }
                        else if (exec2){
                            var before = (/[a-zA-Z]{1,10}/.exec(exec2[0])[0]).toUpperCase()
                            var after = (/[0-9]{2,10}/.exec(exec2[0])[0]).toUpperCase()
                            json.code_before = before
                            json.code_after = after
                            json.code = before+'-'+after
                        }
                        else{
                            console.log(name)
                            return
                        }

                        list.push(json)
                    }

                    names = []
                    images = []
                    urls = []
                }
            }

        })

        done(list)

        // $('img').each(function(){
        //     if( this.attribs.border==0 )
        //         console.log(this.attribs.src)
        // })
        return

        for(var i=0, j=links.length; i<j; i++)
        {
            var self = links[i]

            if( self.name==='font'){
                self
            }

            if( self.name==='a' && self.attribs.href.indexOf('http://www3.17domn.com') > -1)
                console.log(self.attribs.href)
        }

        // links.each(function(){
        //     var tag = this.prev.name
        //     var data = this.prev.data
        //     // if( !tag && data )
        //     //     console.log('/',this.prev.data, '/')

        //     if( this.name === 'img')
        //         console.log(this.attribs.src)
        // })
        // console.log(links)
    })
}

function getPageList(url, done)
{
    var list = []

    getHTML(url, function(html)
    {
        var $ = cheerio.load(html);
        var links = $('#content').find('a')

        links.each(function()
        {
            var url = $(this).attr('href')
            var title = this.children[0].data

            if( title && url.indexOf('/p2p') > -1 && !/无码/.test(title) ){
                list.push('http://we.99btgc.com' + url)
            }
        })

        done(list)
    })
}

// Movie.remove({}, function(){

// })
// History.remove({}, function(){

// })

 var list = [
   'http://we.99bitgongchang.org/00/0814.html'
]

var task = []

list.forEach(function(burl)
{
                    	console.log(burl)
    task.push(function(done)
    {
        History.findOne({ url: burl }, function(err, doc)
        {
            // if( doc ){
            //     console.log('------', burl)
            //     return done()
            // }

            getPageList(burl, function(list)
            {
                var time1 = 1
                var taskList = []

                list.forEach(function(url)
                {
                    taskList.push(function(done)
                    {
                    	console.log(url)
                        History.findOne({ url: url }, function(err, doc)
                        {
                            // if( doc )
                            //     return done()

                            var date = '20' + url.substring(url.length - 22, url.length - 14)
                            
                            getPage(url, function(list)
                            {
                                list.forEach(function(rec)
                                {
                                    rec.date = date
                            		rec.time = new Date(date).getTime()

                            		Movie.findOne({ code: rec.code }, function(err, doc)
                            		{
                                        if( !doc ){
                                            console.log('create', rec.code)
                                            // Movie.create(rec, function(){

                                            // })
                                        }
                                        else{
                                        	// console.log('____________', rec.code)
                                            // console.log('update', rec.code)
                                            // Movie.updateById(doc._id, rec, function(){

                                            // })
                                        }
                                    })
                                    // Movie.create(rec, function(){

                                    // })
                                })

                                // History.create({ url: url }, function(){
                                    done()
                                // })
                            })
                        })
                    })
                })

                async.series(taskList, function(){
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

async.series(task, function(){
    console.log('all is done')
})

 // '180':
 //  { type: 'tag',
 //    name: 'br',
 //    attribs: {},
 //    children: [],
 //    next:
 //     { data: '\r\n',
 //       type: 'text',
 //       next: null,
 //       prev: [Circular],
 //       parent: [Object] },
 //    prev:
 //     { type: 'tag',
 //       name: 'a',
 //       attribs: [Object],
 //       children: [Object],
 //       next: [Circular],
 //       prev: [Object],
 //       parent: [Object] },
 //    parent:
 //     { type: 'tag',
 //       name: 'div',
 //       attribs: [Object],
 //       children: [Object],
 //       next: [Object],
 //       prev: [Object],
 //       parent: [Object] } },
 // options:
 //  { normalizeWhitespace: false,
 //    xmlMode: false,
 //    decodeEntities: true },
 // _root:
 //  { '0':
 //     { type: 'root',
 //       name: 'root',
 //       parent: null,
 //       prev: null,
 //       next: null,
 //       children: [Object] },
 //    options:
 //     { normalizeWhitespace: false,
 //       xmlMode: false,
 //       decodeEntities: true },
 //    length: 1,
 //    _root: [Circular] },
 // length: 181,
 // prevObject:
 //  { '0':
 //     { type: 'tag',
 //       name: 'div',
 //       attribs: [Object],
 //       children: [Object],
 //       next: [Object],
 //       prev: [Object],
 //       parent: [Object] },
 //    options:
 //     { normalizeWhitespace: false,
 //       xmlMode: false,
 //       decodeEntities: true },
 //    _root: { '0': [Object], options: [Object], length: 1, _root: [Circular] },
 //    length: 1,
 //    prevObject: { '0': [Object], options: [Object], length: 1, _root: [Circular
 // } } }