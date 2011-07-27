module.exports = config = {
    "name" : "Hummingbird",

    "tracker_http_port" : 8000,
    "tracker_net_port"  : 8025,
    "dashboard_port" : 8050,

    /* if specified, use these values - suggests a node balancer is involved.
     * otherwise, we use localhost + port
    "hostnames" : {
	"tracker": "servedby.somehost.com",
	"dashboard": "dashboard.somehost.com"
     },
    */

    "mongo_host" : "localhost",
    "mongo_port" : 27017,

    "udp_address" : "0.0.0.0",
    "udp_port" : 8000,

    "enable_dashboard" : true,
    "enable_tracker"   : false,

    "capistrano" : {
        "repository" :       "git://github.com/qzaidi/hummingbird.git",
        "hummingbird_host" : "qzaidi.github.com"
    }
}
