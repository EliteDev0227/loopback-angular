'use strict';

var common = require('./common');
var loopback = require('loopback');
var boot = require('loopback-boot');

var bodyParser = require('body-parser');
var multer = require('multer');
var app = module.exports = loopback();





app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(multer({dest:'/api/'}).any());
//app.use(multer({dest:'/api/driverApi/'}).any());

app.use('/api/driverApi', multer({dest:'/api/driverApi/'}).any());
app.use('/api/dispatcherApi', multer({dest:'/api/dispatcherApi/'}).any());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;


  // start the server if `$ node server.js`
  if (require.main === module)
//    app.start();
  app.io = require('socket.io')(app.start());
  app.io.origins('*:*');

  app.io.on('connection', function (socket) {

    console.log('new socket connected', socket.id);

    socket.emit('news', { hello: 'world' });

    socket.on('new-message', function (data) {
      console.log('new message', data);
    });

    socket.on('login', function(data){
      console.log('login', data.token);
      app.models.AccessToken.findById(data.token, function(err, token) {
        if (!err) {
          console.log('socket user', token.userId);
          app.models.User.findById(token.userId, function(err, user) {
            if (!err) {
              if (user.driver_id) {
                common.socketList[user.driver_id] = socket;
                common.socketIdList[socket.id] = user.driver_id;
              }
                // common.socketList[user.id] = socket;
                // common.socketIdList[socket.id] = user.id;
                console.log('new login',);
                console.log('socketIdList', common.socketIdList);
            }
          })
        }
      })
    });

    socket.on('disconnect', function () {
      var tempUserId = common.socketIdList[socket.id];
      delete common.socketIdList[socket.id];
      delete common.socketList[tempUserId];
      console.log('logout');
      console.log('socketIdList', common.socketIdList);

    });
  });
});

