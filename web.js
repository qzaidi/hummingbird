require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var config = require('./config/config'),
    Tracker = require('tracker').Tracker;

var ts = new Tracker(config.tracker_http_port,config.tracker_net_port);
