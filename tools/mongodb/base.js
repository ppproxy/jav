
var ObjectID = require('mongoskin').ObjectID;

function Base(){

}

Base.prototype.find = function(data, done)
{
	this.dbColl.find(data).toArray(function(err, list)
	{
		if( err ){
			err = 'Base.find error: ' + err;
			console.error(err);
		}

		done(err, list);
	});
}

Base.prototype.findById = function(id, done)
{
	this.dbColl.findById(id, function(err, doc)
	{
		if( err ){
			err = 'Base.findById error: ' + err;
		}

		done(err, doc);
	});
}

Base.prototype.update= function(query, data, done)
{
	this.dbColl.update(query, { $set: data }, {multi: true}, function(err, doc)
	{
		if( err ){
			err = 'Base.update error: ' + err;
			console.error(err);
		}

		done && done(err, doc);
	});
}

Base.prototype.updateById = function(id, data, done)
{
	this.dbColl.updateById(id, { $set: data }, function(err, doc)
	{
		if( err ){
			err = 'Base.updateById error: ' + err;
			console.error(err);
		}

		done && done(err, doc);
	});	
}
Base.prototype.removeById = function(id, done)
{
	this.dbColl.removeById(id, function(err, count)
	{
		if( err ){
			err = 'Base.removeById error: '+ err;
			console.error(err);
		}
		else if( count === 0 ){
			console.error('Base.removeById error, id is not find : ' + id)
		}
		
		done(err);
	});	
}

Base.prototype.remove = function(data, done)
{
	this.dbColl.remove(data, function(err, doc)
	{
		if( err ){
			err = 'Base.remove error: ' + err;
			console.log(err);
		}

		done(err);
	});
}

Base.prototype.create= function(data, done)
{
	if( !data._id )
			data._id = this.createId();
		
	this.dbColl.insert(data, function(err, doc)
	{
		if( err ){
			err = 'Base.create error: '+ err;
			console.error(err, data);
		}

		done && done(err, !err && doc.length ? doc[0]: null);
	});
}

Base.prototype.setLock = function(query, done)
{
	this.dbColl.findAndModify(query, [], { $inc: { lock: 1 }, $set: { status: 'Pending' } }, function(err, doc)
	{
		if( err ){
			err = 'Base.setLock error: ' + err;
			console.error(err);
		}

		done && done(err, doc && doc.lock !== 0);
	});
}

Base.prototype.clearLock = function(query, done)
{
	this.dbColl.update(query, { $set: { lock: 0 } }, function(err, doc)
	{
		if( err ){
			err = 'Base.setLock error: ' + err;
			console.error(err);
		}
		done && done(err);
	});
}

Base.prototype.findOne = function(query, done)
{
	this.dbColl.findOne(query, function(err, doc)
	{
		if( err ){
			err = 'Base.findOne error: ' + err;
			console.error(err);
		}

		done && done(err, doc);
	});
}

Base.prototype.createId = function(){
	return ObjectID() + '_';
}

module.exports = Base;