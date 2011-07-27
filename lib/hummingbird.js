var sys = require('sys'),
  fs = require('fs'),
  config = require('../config/config'),
  View = require('view').View,
  Metric = require('metric').Metric,
  arrays = require('deps/arrays');

var Hummingbird = function() {
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
    // for each account, open their visits collection, and then add it to this.collections object.
    // invoke callback only for the last account.
    // we need to split the tracking server from the real time reports server. The tracking server will just
    // send data on the udp port to the reports server.
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
      metric.init(db,self.collection);
      metric.socket = socket;
      self.metrics.push(metric);
    });
  },

  insertData: function(env) {
    var view = new View(env);

    console.log("inserting data into db");
    env.url_key = view.urlKey;
    env.product_id = view.productId;

    this.collection.insertAll([env]);

    for(var i = 0; i < this.metrics.length; i++) {
      if (this.metrics[i].incrementCallback) {
        this.metrics[i].incrementCallback(view);
        this.metrics[i].isDirty = true;
      }
    }
  },
};

exports.Hummingbird = Hummingbird;
