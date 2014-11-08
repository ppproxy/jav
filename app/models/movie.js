var dbColl= require('../../tools/mongodb/db').getCollection('movie')
var Base = require('../../tools/mongodb/base.js')


function Table(){
	this.dbColl = dbColl;
}

Table.prototype = new Base();

Table.prototype.create = function(data, done)
{
	data._id = data.user_id;
	

	if( !data.code )
	{
		dbColl.insert(data, function(err, doc)
		{
			if( err || doc.length !== 1 ){
				err = 'Movie.create error : ' + err 
				console.error(err);
			}
			
			done(err, doc[0]);
		});
	}

	dbColl.findOne({ code: data.code }, function(err, doc)
	{
		// if( doc ){
		// 	console.log(data.code)
		// 	console.log('exists!!!!!!!!!!!!!!!!!!!!!')
		// 	return done()
		// }

		dbColl.insert(data, function(err, doc)
		{
			if( err || doc.length !== 1 ){
				err = 'Movie.create error : ' + err 
				console.error(err);
			}
			
			done(err, doc[0]);
		});
	})

	
}

Table.prototype.findByUserId = function(user_id, done)
{
	dbColl.findById(user_id, function(err, doc){
		done(err, doc)
	});
}

module.exports = new Table();