/* dummy user auth module */

var users = {
	'hummingbird' : { login: 'hummingbird', password: 'password', role: 'admin' },
	'guest' : { login: 'guest', password: 'anonymous', role: 'user' }
};

module.exports.authenticate = function ( login, password, callback) {
  var user = users[login];
  console.log("AuthRequest: login = " + login + " pass= " + password + " user=" + user);
  if (user && user.password == password) {
     return callback(user);
  }
  return callback(null);
};
