require.paths.unshift(__dirname);

var net = require('net'),
    fs = require('fs'),
    sys = require('sys'),
    http = require('http'),
    Cookie = require('cookie').Cookie;

var Tracker = function(trackerPort,backendPort) {
  var pixelData = fs.readFileSync(__dirname + "/../images/tracking.gif", 'binary');
  this.pixel = new Buffer(43);
  this.pixel.write(pixelData, 'binary', 0);

  this.trackerPort = trackerPort;
  this.backendPort = backendPort;
  this.connect();

  var 		tracker = this;
  this.server = http.createServer(function(req,res) {
				   try {
				     tracker.serveRequest(req,res);
				   } catch(e) {
				     tracker.handleError(req,res,e);
				   }
				 }).listen(trackerPort,"0.0.0.0");
};

Tracker.prototype = {

  connect: function() {
     function startReconnectLoop (tracker) {
	if (!tracker)
	  throw new Error("bad tracker object");
        tracker.timer = setTimeout(function() {
				    tracker.connect(tracker);
				   }, 5000 );
     }

     function reconnectLoop (tracker) {
        sys.log("trying to connect to backend server at " + tracker.backendPort);
        try {
	   tracker.client = net.createConnection(tracker.backendPort);

	   if (tracker.client)
	    {
 	      tracker.client.on("connect", function() {
	   	      sys.log("connected");
		      if (tracker.timer) {
		        clearTimeout(tracker.timer);
		         tracker.timer = undefined;
		      }
		    });

	      tracker.client.on('error', function(e) {
		      sys.log("An exception occoured while trying to connect" + e);
		      /* startReconnectLoop(tracker); - Close is always fired after this*/
		    });

	      tracker.client.on('close', function() { 
		       sys.log("connection closed by backend server");
		       startReconnectLoop(tracker);
		    });
	   }
        } catch(e) {
	  sys.log("failed to connect. retrying in 5 seconds " + e);
	  startReconnectLoop(tracker);
        }
      }
      reconnectLoop(this);
    },

  serveRequest: function(req, res) {
    var env = this.splitQuery(req.url.split('?')[1]);
    req.env = env;
    req.cookie = new Cookie(req.headers.cookie,env);
    this.writePixel(req,res);

    env.timestamp = new Date();
    env.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    env.ua = req.headers['user-agent'];
    env.uid = req.cookie.uid;
    env.referrer = req.referrer;
    this.sendData(req);
  },

  sendData: function(req) {
    // create a msg packet and send it to backend server, \n is the delimiter
    var data = JSON.stringify(req.env) + '\n';
    sys.log("sending " + data);
    this.client.write(data); 
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
    var cookie = req.cookie;
    var env = req.env;
    var retcode = 200;
    var reshdrs = {
		   'P3P'		: 'CP=NOI DEVo TAIa OUR BUS',
		   'Cache-Control' 	: 'no-cache, private',
                   'Expires' 		: 'Thu, 01 Jan 1970 00:00:00 GMT',
                   'Pragma'  		: 'no-cache'
		  };


    if (cookie.dirty)
      reshdrs['Set-Cookie'] = cookie.pack();

    if (   (env.redir != undefined)
        && (env.redir.indexOf('http') == 0) )
     {
       reshdrs['Location'] = env.redir;
       delete env.redir;
       retcode = 301;
     }
    else 
     {
       reshdrs['Content-Type'] = 'image/gif';
       reshdrs['Content-Disposition'] = 'inline';
       reshdrs['Content-Length'] = '43';
     }

    res.writeHead(retcode,reshdrs);
    res.end(retcode==200?this.pixel:null);
  },

  handleError: function(req, res, e) {
    res.writeHead(500, {});
    res.write("Server error");
    res.end();

    e.stack = e.stack.split('\n');
    e.url = req.url;
    sys.log(sys.inspect(e));
  }
};

exports.Tracker = Tracker;
