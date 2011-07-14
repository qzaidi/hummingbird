var sys = require('sys'),
    express = require('express'),
    weekly = require('weekly');

var app = express.createServer();

app.configure(function(){
  app.set('root', __dirname);
  app.set('db', db);
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public', { maxAge: 86400 }));
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

app.post('/login', function(req,res) {
    if(req.body.password == 'password') {
      res.cookie('not_secret', req.body.password);
      sys.log("Auth succeeded for " + req.body.username);
      res.redirect('/');
    } else {
      sys.log("Auth failed for " + req.body.username);
      res.redirect('/login');
    }
  });

app.listen(config.dashboard_port);
