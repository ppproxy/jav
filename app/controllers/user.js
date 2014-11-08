var express = require('express')
	, router = express.Router()

router.post('/register', function(req, res)
{
	User.checkAndCreate(req.body, function(err, doc)
	{
		if( err )
            return res.render('register', { user: req.session.user, message: 'The email already exists!' });

        res.render('page/page', { user: req.session.user });
	})

})


router.post('/login', function(req, res)
{
	console.log(req.body)
	 User.findOne({ email: req.body.email, password: req.body.password }, function(err, doc)
	 {
	 	console.log(doc)
        if( !doc )
            return res.render('page/login', { user: req.session.user, message: 'Username or password is wrong!' });
    
        req.session.user = doc;
        res.render('page/page', { user: req.session.user });
    })
})



module.exports= router