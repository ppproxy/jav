var express = require('express')
	, router = express.Router()

router.get('/desktop', function(req, res)
{
    UserContainer.findByUserId(req.session.user._id, function(err, doc)
    {
        if( doc && doc.status === 'complete' )
            res.render('index', {
                user_id: req.session.user._id
            });
        else
            res.render('create', { container: doc })
    })
})


module.exports= router
