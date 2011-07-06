var sys = require('sys'),
  fs = require('fs'),
  config = require('../config/config'),
  View = require('view').View,
  Metric = require('metric').Metric,
  Buffer = require('buffer').Buffer,
  io = require('socket.io'),
  arrays = require('deps/arrays'),
  querystring = require('querystring'),
  Cookie = require('cookie').Cookie;

var Hummingbird = function(db, callback) {
  var pixelData = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
  this.pixel = new Buffer(43);
  this.pixel.write(pixelData, 'binary', 0);

  this.metrics = [];
};

Hummingbird.prototype = {
  init: function(db, callback) {
    this.setupDb(db, function() {
      callback();
    });
  },

  setupDb: function(db, callback) {
    var self = this;
    db.createCollection('visits', function(err, collection) {
      db.collection('visits', function(err, collection) {
        self.collection = collection;
        callback();
      });
    });
  },

  addAllMetrics: function(socket, db) {
    var self = this;

    Metric.allMetrics(function(metric) {
      metric.init(db);
      metric.socket = socket;
      self.metrics.push(metric);
    });
  },

  serveRequest: function(req, res) {

    this.writePixel(req,res);

    var env = this.splitQuery(req.url.split('?')[1]);
    env.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    env.ua = req.headers['user-agent'];

    this.insertData(env);
  },

  insertData: function(env) {
    env.timestamp = new Date();
    var view = new View(env);

    env.url_key = view.urlKey;
    env.product_id = view.productId;

    this.collection.insertAll([env]);

    for(var i = 0; i < this.metrics.length; i++) {
      this.metrics[i].incrementCallback(view);
      this.metrics[i].isDirty = true;
    }
  },

  splitQuery: function(query) {
    var queryString = {};
    (query || "").replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) { queryString[$1] = querystring.unescape($3.replace(/\+/g, ' ')); }
    );

    return queryString;
  },

  writePixel: function(req,res) {
    var cookie = new Cookie(req.headers.cookie);
    var reshdrs = {'Content-Type': 'image/gif',
		   'Content-Disposition': 'inline',
		   'Content-Length': '43' 
		  };

    if (cookie.dirty)
      reshdrs['Set-Cookie'] = cookie.pack();

    res.writeHead(200,reshdrs);
    res.end(this.pixel);
  },

  handleError: function(req, res, e) {
    res.writeHead(500, {});
    res.write("Server error");
    res.end();

    e.stack = e.stack.split('\n');
    e.url = req.url;
    sys.log(JSON.stringify(e, null, 2));
  }
};

exports.Hummingbird = Hummingbird;
