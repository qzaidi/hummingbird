//var crypto = require('crypto');

function parseCookie(str) {
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim().toLowerCase()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // Quoted values
    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    // Only assign once
    if (obj[key] === undefined) {
      obj[key] = decodeURIComponent(val.replace(/\+/g, ' '));
    }
  }
  return obj;
};

function genuid(len) {
  return Math.random().toString(36).substring(2,len);
};

var Cookie = function(cookiehdr) {
  this.uid == undefined;
  this.segments = [];
  this.dirty = false;
  this.init(cookiehdr);
};

Cookie.prototype.init = function(cookiehdr) {
  if (cookiehdr)
    this.unpack(cookiehdr);
  if (this.uid == undefined) {
    this.uid = genuid(12);
    this.dirty = true;
  }
};

Cookie.prototype.pack = function() {
 var obj = { 'uid': this.uid, 'segments': this.segments };
 var buf = new Buffer(JSON.stringify(obj));
 var pairs = [ "tuid=" + buf.toString(encoding='base64') ];
 var expires = new Date((new Date()).getTime() + 24*90*3600*1000);
 pairs.push("expires=" + expires.toUTCString());
 return pairs.join('; ');
};

Cookie.prototype.unpack = function(cookiehdr) {
  var cookies = parseCookie(cookiehdr);
  if (cookies['tuid'] != undefined) {
    var b = Buffer(cookies['tuid'],'base64');
    var obj = JSON.parse(b.toString());
    this.uid = obj['uid'];
    this.segments = obj['segments'];
  }
};

exports.Cookie = Cookie;
