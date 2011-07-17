var TimeBucketers;
if (!TimeBucketers) { TimeBucketers = {}; }

TimeBucketers.closestSecondFor = function(timestamp) {
  return parseInt(timestamp / 1000,10) * 1000;
};

TimeBucketers.closestMinuteFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestHourFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.getTime();
};

TimeBucketers.closestSliceFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setUTCMinutes(parseInt(date.getMinutes()/30,10)*30);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.getTime();
};


TimeBucketers.closestDayFor = function(timestamp) {
  var date = new Date(timestamp);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);
  return date.getTime();
};

exports.TimeBucketers = TimeBucketers;
