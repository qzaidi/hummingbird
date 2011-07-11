var sys = require('sys'),
    TimeBucketers = require('Timebucketers').TimeBucketers;

Aggregates = function(collection) {
  if ( !(this instanceof Aggregates) ) {
    return new Aggregates(collection);
  }
  this.collection = collection;
};

Aggregates.prototype = {
  
  daySeconds:86400,

  mapper: function() {
    emit(this.uid, { count:1 });
  },

  reducer: function(key, values) {
     var result = { count: 0 };
     values.forEach(function(value) {
         result.count += value.count;
         });
     return result;
   },

  lastDay: function(datacallback) {
     var now = TimeBucketers.closestDayFor((new Date()).getTime());
     var oneDayAgo = now - this.daySeconds*1000;
 
     return this.aggregateDay(oneDayAgo,now,datacallback);

  },

  aggregateDay: function(timeStart, timeEnd, dataCallback) {
       var options, executor;

       options = {
                    query: { 
                              'timestamp': { '$gte': new Date(timeStart), '$lte': new Date(timeEnd) } ,
                               'uid': { '$exists': true } 
                     	   }, 
                     out: "uniques"
                 };

       executor = function(err,mrCollection) {
         if (err) {
           sys.puts("An Error occured in mapReduce: " + err);
         } else {
           mrCollection.find({}, function(err, cursor) {
               if (!err) {
                 cursor.each(function(err, item) {
                   if (!err) {
                     dataCallback(item);
                     if (item == null)
                       mrCollection.drop();
                   } else
		     console.log("Error in mapreduce " + err);
                 });
               }
          });
        }
     };

     this.collection.mapReduce(this.mapper, this.reducer, options, executor);
   },

   start: function(callback) {
     var date = new Date();
     var seconds;
     var dayRunner = function(obj) {
        obj.lastDay(function(data) {
	   callback(data);
        });
      }

     dayRunner(this);
     date.setMilliseconds(0);

     seconds = (this.daySeconds - (date.getHours() * 3600 + date.getMinutes()*60 + date.getSeconds()));
     sys.log("Setting Day cron to run after " + seconds + " seconds");

     setTimeout(function(obj) {
	  sys.log("Running first day end tasks");
	  dayRunner(obj);
          setInterval(dayRunner, 86400*1000, obj);
    	}, seconds*1000, this);
   }
};

exports.Aggregates = Aggregates;

/* Unit test code */
if (require.main === module) {
  var config = require('../config/config'),
      mongo = require('mongodb');
 
  var db;

  db = new mongo.Db('hummingbird', new mongo.Server(config.mongo_host, config.mongo_port, {}), {});
  sys.puts("opened database hummingbird");
  db.open(function(p_db) {
      db.collection('visits',function(err,collection) {

  	var a = new Aggregates(collection);
  	a.start(function(data) {
          if (data != null) {
            sys.puts(sys.inspect(data));
          } else {
            // db.close();
          }
          });
        });
      });
}
