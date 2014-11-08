
var initUser = function (user, callback) 
{
	user._id = user.openID;

	User.checkAndCreate(user, function(err, doc)
	{
		if( err )
			return res.render('error');

		callback(doc);
	});
}


module.exports = function(app)
{
	

	app.all('/desktop/*', function (req, res, next) 
	{
		if( req.path.indexOf('.') > 0 )
			return next()

		if (!req.user) {
			res.render('page');
		}
		else 
		{
			initUser(req.user, function (user) {
				req.user._id = req.user.openID;
				next();
			});
		}
	});
	
	app.use('', require('../app/controllers/page.js'))
	app.use('', require('../app/controllers/desktop.js'))
	app.use('', require('../app/controllers/user.js'))
}
