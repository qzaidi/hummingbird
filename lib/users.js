/* dummy user auth module */

var users = {
	'hummingbird' : { login: 'hummingbird', password: 'password', role: 'admin', accounts: [] },
	'guest' : { login: 'guest', password: 'anonymous', role: 'user' , accounts: []}
};

// each account can represent a publisher domain, ad agency etc
var accounts = {
    'test'   : { id:1 , active:true  },
    'dev'    : { id:2 , active:true  },
    'blog'   : { id:3 , active:true  }
};

module.exports.authenticate = function ( login, password, callback) {
  var user = users[login];
  console.log("AuthRequest: login = " + login + " pass= " + password + " user=" + user);
  if (user && user.password == password) {
     return callback(user);
  }
  return callback(null);
};
