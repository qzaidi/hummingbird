$(function () {
  $.getJSON("//" + siteconfig.report + "/json/hour?callback=?", function(data) {
    var today = new Date();
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var time = today.getTime();
    var d1 = data.map(function(d,index,array) {
                   console.log(d);
                   return [ d.hour , d.total || 0];
                 });  

    var options = {
        bars: { show: true, barWidth: 1, fill: 0.9 },
        xaxis: { mode:"time", tickLength: 4 , min:(time-24*3600*1000) , max:time},
    };

    $.plot($("#day"),[ { 'label':'Impressions Last Day', 'data': d1 } ],  
           options)
  });

  $.getJSON("//" + siteconfig.report + "/json/minute?callback=?", function(data) {
    var today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);
    var time = today.getTime();
    var d1 = data.map(function(d,index,array) {
                   console.log(d);
                   return [ d.minute , d.total || 0];
                 });  
    var options = {
        bars: { show: true, barWidth: 0.6, fill: 0.9 },
        xaxis: { mode:"time", tickLength: 4 , min:(time-3600*1000) , max:time},
    };
    $.plot($("#hour"),[ { 'label':'Impressions Last Hour', 'data': d1 } ],  
           options)
  });

  $.getJSON("//" + siteconfig.report + "/json/day?callback=?", function(data) {
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var time = today.getTime();
    var d1 = data.map(function(d,index,array) {
                   console.log(d);
                   return [ d.day , d.total || 0];
                 });  
    var options = {
        bars: { show: true, barWidth: 0.5, fill: 0.9 },
        xaxis: { mode:"time", tickLength: 1 , min:(time-24*7*3600*1000) , max:time},
    };
    $.plot($("#week"),[ { 'label':'Impressions Last Week', 'data': d1 } ],  
           options)
  });
 
});

