var TimeBucketers;
if (!TimeBucketers) { TimeBucketers = {}; }

TimeBucketers.closestSecondFor = function(timestamp) {
  return parseInt(timestamp / 1000,10) * 1000;
};

TimeBucketers.closestMinuteFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestHourFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestSliceFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setMinutes(parseInt(date.getMinutes()/30,10)*30);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};


TimeBucketers.closestDayFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setMinutes(0);
  date.setHours(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
};

exports.TimeBucketers = TimeBucketers;
