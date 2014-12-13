var express = require('express')
	, router = express.Router()
	, Movie = require('../../tools/mongodb/db.js').getTable('movie')

function search(query, req, res)
{
	var page = (parseInt(req.params.page) || 1)

	Movie.dbColl.count(query, function(err, count)
	{
		count = Math.ceil(count /30) || 1

		if( page > count )
			page = count 

		if( page < 0 )
			page = 0

		// query.seeds = { $exists: true }

		console.log(page, count)

		console.log(query)

		Movie.dbColl.find(query).sort({ date: -1 }).limit(30).skip((page-1) * 30).toArray(function(err, docs)
		{
			console.log(err)
			var bsize = 3
			var esize = 3

			var begin = (page - bsize ) > 0 ? page - bsize : 1

			var pnum = begin < bsize ? (bsize + esize) - (page + esize) + 1 : 0

			if( pnum < 0 )
				pnum = 0

			var end = (page + esize + pnum ) <= count ? page + esize +pnum : count

			if( (end) === count )
				begin -= (page + esize - count)

			if( begin <= 0 )
				begin = 1

			if( end <= 1 )
				end = 1

			// if( end < )

			// var ObjectID = require('mongoskin').ObjectID;


			// var ids = require('../../ids2.json')

			// // console.log(ids)
			// var list = []
			// for(var key in ids)
			//     list.push(ObjectID(key))

			// Movie.dbColl.find({ _id: {$in: list}}).sort({code: -1}).limit(100).toArray(function(err, docs){
			// 	res.render('page/page', { docs: docs, count: count/30, page: page, begin: begin, end: end, search: req.params.search })
			//     // console.log(doc)
			// })
			// return
			console.log(err, docs)
			res.render('page/page', { docs: docs, count: count/30, page: page, begin: begin, end: end, search: req.params.search })
		})
	})
}

router.get('/download', function(req, res)
{
	search({seeds:{ $exists: true }}, req, res)
})

router.get('/like', function(req, res)
{
	search({ like: true }, req, res)
})
router.get('/:page', function(req, res)
{
	search({  }, req, res)
})

router.get('/search/:search/:page', function(req, res)
{
	search({ $or: [{ title: RegExp(req.params.search)}, {code: RegExp(req.params.search) }, {cast: RegExp(req.params.search) }, {tags: RegExp(req.params.search) } ] }, req, res)
})


router.get('/download/:page', function(req, res)
{
	search({seeds : { $exists: true }}, req, res)
})

router.get('/', function(req, res)
{
	search({}, req, res)
})

router.get('/search/:search', function(req, res)
{
	search({ $or: [{ title: RegExp(req.params.search)}, {code: RegExp(req.params.search) }, {cast: RegExp(req.params.search) }, {tags: RegExp(req.params.search) } ] }, req, res)
})

router.get('/info/:_id', function(req, res)
{
	Movie.findById(req.params._id, function(err, doc)
	{
		res.json(doc)
	})
})

router.post('/like/:_id', function(req, res)
{
	Movie.findById(req.params._id, function(err, doc)
	{
		Movie.updateById(req.params._id, { like: !doc.like }, function(err)
		{
			res.json({ like: !doc.like })
		})
	})
})

router.post('/updateMovie', function(req, res)
{
	var id = req.body._id
	delete req.body._id

	Movie.updateById(id, req.body, function(){
		res.json(req.body)
	})
})

router.post('/deleteMovie/:_id', function(req, res)
{
	Movie.removeById(req.params._id, function(){
		res.redirect(req.headers.referer.replace(req.headers.origin, ''))
	})
})

// Movie.find({}, function(err, docs)
// {
// 	console.log(docs.length)
// })
router.get('/login', function(req, res)  
{
    if( req.method === "GET" )
        return res.render('page/login', { user: req.session.user, message: '' })

   
})

router.get('/register', function(req, res)
{   
    console.log(req.session.user)
    if( req.method === "GET" )
        return res.render('page/register', { user: req.session.user, message: '' })
})

module.exports= router