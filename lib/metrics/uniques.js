require.paths.unshift(__dirname + '/..');

var Aggregates = require('aggregates').Aggregates,
    TimeBucketers = require('timebucketers').TimeBucketers;

var UniquesMetric = {
  name: 'uniques',
  isDayMetric: true,
  dayData : { uniques: 0 },
  initDayMetric: function(metric) {
    var a = new Aggregates(metric.visits);
    a.start(function(data) {
	      if (data == null) {
		 var timestamp = TimeBucketers.closestDayFor((new Date()).getTime());
	         metric.dayLogger(metric.dayData,timestamp);
		 metric.dayData.uniques = 0;
	      } else {
	         metric.dayData.uniques += 1;
	      }
	   });
    metric.aggregates = a;
  }
};

for (var i in UniquesMetric)
  exports[i] = UniquesMetric[i];
