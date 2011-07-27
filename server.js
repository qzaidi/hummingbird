require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var net = require('net'),
    config = require('./config/config'),
    fs = require('fs'),
    dgram = require('dgram'),
    io = require('socket.io'),
    mongo = require('mongodb'),
    Hummingbird = require('hummingbird').Hummingbird;

db = new mongo.Db('hummingbird', new mongo.Server(config.mongo_host, config.mongo_port, {}), {});

db.addListener("error", function(error) {
  console.log("Error connecting to mongo -- perhaps it isn't running?");
});

db.open(function(p_db) {
    var hummingbird = new Hummingbird();
    hummingbird.init(db, function() {
    var server = net.createServer(function(client) {
	console.log("client connected ....");
	var fragment = '';

	client.addListener('data', function(data) {
	   // read one chunk, and pass it to insertData
	   // all this code needs to be abstracted as a Messaging class
	   // which can internally use json/protobuf etc
	   data = fragment + data;

	   var msg = data.split(),
	       length = msg.length - 1,
	       i;

	  /* check for completeness */
	  if (data[data.length-1] == '\n')
	    length++
	  else
	    fragment = msg[length];

	   for (i = length; i--; ) {
	     try {
	       console.log("recieved essage " + data);
	       var env = JSON.parse(msg);
	       hummingbird.insertData(env); 
             } catch(err) {
	       console.log("Failed to parse message: " + msg);
	     }
	   }
	});
    });
    server.listen(config.tracker_net_port,"0.0.0.0");
    hummingbird.server = server;
    console.log('Tracker backend server running at tcp://*:' + config.tracker_net_port);

    if (config.enable_tracker) {
      // start server here -this is when we don't want to run web instances seperately
      require('web');
    }

    if (config.enable_dashboard) {
      var app = require('monitor').app;
      var socket = io.listen(app);
      socket.on('connection', function(client){
        // new client is here!
        client.on('disconnect', function(){ console.log("Lost ws client"); });
      });
      hummingbird.socket = socket;
      hummingbird.addAllMetrics(socket, db);
      console.log('Web Socket server running at ws://*:' + config.dashboard_port);
    }

    /* legacy, will be removed */
    if(config.udp_address) {
      var udpServer = dgram.createSocket("udp4");

      udpServer.on("message", function(message, rinfo) {
        console.log("message from " + rinfo.address + " : " + rinfo.port);

        var data = JSON.parse(message);
        hummingbird.insertData(data);
      });

      udpServer.bind(config.udp_port, config.udp_address);
      console.log('UDP server running on UDP port ' + config.udp_port);
    }
  });
});


