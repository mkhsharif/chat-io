let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let uuidv4 = require('uuid/v4');
users = [];
connections = [];

server.listen(process.env.PORT || 3000);

app.use(express.static('public', { index: false }));

console.log('server running...');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/public', (req, res) => {
  res.redirect('/');
});

app.get('/:id', (req, res) => {
  res.sendFile(__dirname + '/public/private.html');
  io.sockets.on('connection', socket => {
    try {
      if (io.sockets.adapter.rooms[req.params.id].length === 2) {
        socket.emit('full room');
      } else {
        connections.push(socket);
        socket.join(req.params.id);
        io.sockets
          .in(req.params.id)
          .emit('peer join', { roomId: req.params.id, isPublic: false });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

io.sockets.on('connection', socket => {
  connections.push(socket);

  console.log('Connected: %s sockets connected', connections.length);
  socket.on('join room', isPublic => {
    console.log('isPUBLIC: ' + isPublic);
    let room = '';

    if (isPublic) {
      room = 'public';
      socket.emit('redirect', room);
    } else {
      room = uuidv4().slice(0, 8);
      socket.emit('redirect', room);
    }

    socket.join(room);
    updateUsernames();
  });

  // disconnect
  socket.on('disconnect', data => {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  // send message
  socket.on('send message', (data, room) => {
    io.sockets
      .in(room)
      .emit('new message', { msg: data, user: socket.username });
  });

  // new user
  socket.on('new user', (data, callback) => {
    if (users.length === 0) {
      callback(true);
    } else {
      for (i in users) {
        if (data === users[i]) {
          callback(false);
          return;
        } else {
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
