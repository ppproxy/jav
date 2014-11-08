var express = require('express')
var partials = require('express-partials')
var app = module.exports = express();
var logger = require('morgan');
var config = require('./conf/config.js')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var routes = require('./conf/routes.js')
var path = require('path')
var methodOverride = require('method-override');
var http = require('http')
var multer  = require('multer')
// var bodyParser = require('body-parser');

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/app/views');
app.set('view engine', 'html');

app.set('port', process.env.PORT || config.port);
app.use(partials());
app.use(bodyParser());
app.use(cookieParser());
app.use(cookieSession({secret: '-_-!'}));
app.use(session({ secret: "keyboard cat" }));
app.use(multer({ dest: path.join(__dirname, 'uploads') }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.set("view options",{ name: 'fefefeffefe' })


var server= http.createServer(app)

server.listen(app.get('port'), function(){
  	console.log('Express server listening on port ' + app.get('port'));
});

routes(app)