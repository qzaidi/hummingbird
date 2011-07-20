var sys = require('sys'),
    express = require('express'),
    weekly = require('weekly'),
    users = require('users'),
    Cookie = require('cookie').Cookie;

var app = express.createServer();

app.configure(function(){
  app.set('root', __dirname);
  app.set('db', db);
  app.set('view options', { layout: false });
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({  secret: '1a2b3c4d5e6f',
			     store: require('connect').session.MemoryStore({ reapInterval: 60000 * 10 })
			  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public', { maxAge: 86400 }));
});

function needsAuth(req,res,next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login?redir=' + req.url);
  }
}

app.get('/', needsAuth, function(req,res) {
  res.render('index', { config: config });
});

app.get('/json/:id', function(req,res) {
  var datacallback = weekly.findBy[req.params.id];
  datacallback(app.settings['db'], function(data) {
    res.header("Content-Type", "text/javascript");
    if (req.query.callback)
       data = req.query.callback + '(' + data + ');';
    res.send(data);
  });
});

app.get('/cookie/', function(req,res) {
  // extract and process tuid cookie into a cookie object
  var cookie = new Cookie(req.headers.cookie,null);
  res.render('cookie',{ cookie: { uid:cookie.uid, segments:cookie.segments, firstSeen: new Date(cookie.basetime) } });
});

app.post('/login', function(req,res) {
  users.authenticate(req.body.username,req.body.password, function(user) {
    if (user) { 
       req.session.user = user;
       res.redirect(req.body.redir || '/');
    } else { 
      sys.log("Auth failed for " + req.body.username);
      res.render('login');
    }
  });
});

app.get('/login',function(req,res) {
  res.render('login');
});

app.listen(config.dashboard_port);
