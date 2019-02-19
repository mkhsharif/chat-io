let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
const crypto = require('crypto');
users = [];
connections = [];

//pp.use('/', express.static(__dirname + '/public/'));

//app.use("/public/", express.static('main.js'));

app.use(express.static('public'));

server.listen(process.env.PORT || 3000);
console.log('server running');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', socket => {
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);
  socket.on('room', room => {
      socket.join(room);
  });

  // disconnect
  socket.on('disconnect', data => {
    //if (!socket.username) return;
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  // send message
  socket.on('send message', (data, room) => {
    io.sockets.in(room).emit('new message', { msg: data, user: socket.username });
    
  });

  // new user
  socket.on('new user', (data, callback) => {
    if (users.length === 0) {
      callback(true);
    } else {
      for (i in users) {
        console.log(users);
        if (data === users[i]) {
          console.log('false');
          callback(false);
          return;
        } else {
          console.log('true');
          callback(true);
        }
      }
    }
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
});
