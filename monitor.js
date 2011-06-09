var sys = require('sys'),
    express = require('express'),
    weekly = require('weekly');

var app = express.createServer();

app.configure(function(){
  app.set('root', __dirname);
  app.set('db', db);
});

app.get('/json/:id', function(req,res) {
  var datacallback = weekly.findBy[req.params.id];
  datacallback(app.settings['db'], function(data) {
    res.contentType('json');
    if (req.query.callback)
       data = req.query.callback + '(' + data + ');';
    res.send(data);
  });
});

app.listen(8888);
