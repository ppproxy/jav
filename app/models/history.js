var dbColl= require('../../tools/mongodb/db').getCollection('history')
var Base = require('../../tools/mongodb/base.js')

function Table(){
	this.dbColl = dbColl;
}

Table.prototype = new Base();

Table.prototype.create = function(data, done)
{
	data._id = data.user_id;

	dbColl.findOne({ url: data.code }, function(err, doc)
	{
		if( doc ){
			console.log('history exists!!!!!!!!!!!!!!!!!!!!!')
			return done()
		}

		dbColl.insert(data, function(err, doc)
		{
			if( err || doc.length !== 1 ){
				err = 'history.create error : ' + err 
				console.error(err);
			}
			
			done(err, doc[0]);
		});
	})

	
}

module.exports = new Table();
