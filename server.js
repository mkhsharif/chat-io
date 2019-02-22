let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let uuidv4 = require('uuid/v4');
users = [];
connections = [];

server.listen(process.env.PORT || 3000);
//pp.use('/', express.static(__dirname + '/public/'));

//app.use("/public/", express.static('main.js'));

app.use(express.static('public', { index: false }));

console.log('server running');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
  //return res.redirect('http://localhost:3000/private/4343');
});


app.get('/public', (req, res) => {
    res.redirect('/');
    //return res.redirect('http://localhost:3000/private/4343');
  });

app.get('/:id', (req, res) => {
    console.log('RECEIVED');
    res.sendFile(__dirname + '/public/private.html');
    io.sockets.on('connection', socket => {
        connections.push(socket);
        socket.join(req.params.id);
        info2();
        socket.emit('peer join');
    });

    //info1();
  });

function info1() {
  let clients = io.sockets.adapter.rooms[req.params.id];
  let rooms = io.sockets.adapter.rooms;
  let sockets = io.sockets.sockets;
  console.log('CLIENTS: ');
  console.log(clients);
  console.log('SOCKETS: ');
  console.log(sockets.username);
  console.log('ROOMS: ');
  console.log(rooms);
}

function info2() {
   let clients = io.sockets.adapter.rooms['/'];
    let rooms = io.sockets.adapter.rooms;
    let sockets = io.sockets.sockets;
    // console.log('CLIENTS: ');
    // console.log(clients);
    // console.log('SOCKETS: ');
    // console.log(sockets.username);
    console.log('ROOMS: ');
    console.log(rooms);
  }



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
    info2();
  });

  // disconnect
  socket.on('disconnect', data => {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
    info2();
  });

  // send message
  socket.on('send message', (data, room) => {
    info2();
    console.log(room);
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
