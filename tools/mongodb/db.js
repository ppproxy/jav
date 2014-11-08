var path= require('path')
	, dbType= "mongodb"
	, mongoskin = require('mongoskin'),
	config = require('../../conf/config.js'),
	db = null;
	;

exports.getTable = function(name){
	return require('../../app/models/' + path.join(name + '.js'));
}


exports.getCollection = function (collectionName) 
{
	if (!db) 
	{
		db = mongoskin.db(config.mongodb_url + '?auto_reconnect=true&poolSize=3',
			{numberOfRetries: 1, retryMiliSeconds: 500, safe: true, native_parser: true, },
			{socketOptions: {timeout: 5000}});
	}
	
	return db.collection(collectionName);
}
