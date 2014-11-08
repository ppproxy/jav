var fs = require( 'fs' ),
    stat = fs.stat;
/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
var copy = function( src, dst , callback){
    // 读取目录中的所有文件/目录
    
    stat( src, function( err, st )
    {
        if( err ){
            throw err;
        }
        // 判断是否为文件
        if( st.isFile() ){
            // 创建读取流
            readable = fs.createReadStream( src );
            // 创建写入流
            writable = fs.createWriteStream( dst );   
            // 通过管道来传输流
            readable.pipe( writable );
            callback()
        }
        // 如果是目录则递归调用自身
        else if( st.isDirectory() ){
            exists( _src, _dst, copy );
        }
    });
};

// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( !exists && fs.existsSync(src) ){

	        		console.log(src)
	            callback(null, src, dst );
        }
        // 不存在
        else{
        	callback(true)
            // fs.mkdir( dst, function(){
            //     callback( src, dst );
            // });
        }
    });		
};
		
// 复制目录
// exists( './src', './build', copy );


var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var async = require('async');
var BufferHelper = require('bufferhelper')
var Movie = require('./tools/mongodb/db.js').getTable('movie')
var History = require('./tools/mongodb/db.js').getTable('history')

var ObjectID = require('mongoskin').ObjectID;
var count = 0


function start(num)
{
    Movie.dbColl.find({ image_exists: {$exists:true }}).toArray(function(err, docs)
    {
        var taskList = []
        
        docs.forEach(function(doc, i)
        {
        	taskList.push(function(done)
            {

        		var filename = ('./public/images/99btgc/' + doc.date+'/'+doc._id+'_0.jpg')
        		var toname = './public/images/avimage/'+ doc.code+'.jpg'
        		// console.log(filename)
            	exists(filename, toname, function(err, s, t){
            		if( err )
            			return done()

            		copy(s, t, function(){
            			done()
            		})
            	})
            })

        })
        async.series(taskList, function(){
                
                    console.log('is done')

                })
    })
}

start(0)