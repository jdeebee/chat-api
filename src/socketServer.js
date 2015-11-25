var socketJwt    = require('socketio-jwt');
var socketServer = require('socket.io')();

function start(secureServer, config) {
  socketServer.listen(secureServer);

  // use this (authentication) middleware on every incoming socket
  socketServer.use(socketJwt.authorize({
    secret: config.webTokenSecret,
    handshake: true
  }));

  socketServer.on('connect', function (socket) {
    console.log('a user was connected.');

    // socketServer.emit('news', 'hello there!');
    socket.emit('news', 'hello there!');

    socket.on('otherevent', function (data) {
      console.log(data);
      socket.emit('news', 'you published ' + data.my);
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
       // console.log(socket.decoded_token.email, 'connected');
  });
}

module.exports.start = start;