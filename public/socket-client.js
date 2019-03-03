// $(document).ready(function() {  });

var validMessage = false;
var isPublic = null;
var currentRoom = '';

document.addEventListener('DOMContentLoaded', () => {
  var socket = io.connect();

  var messageForm = document.getElementById('messageForm');
  var message = document.getElementById('message');
  var chat = document.getElementById('chat');
  var messageArea = document.getElementById('messageArea');
  var userFormArea = document.getElementById('userFormArea');
  var userForm = document.getElementById('userForm');
  var users = document.getElementById('users');
  var username = document.getElementById('username');
  var messageLog = document.getElementById('messageLog');
  var public = document.getElementById('public');
  var private = document.getElementById('private');
  var go = document.getElementById('go');
  var modal = document.getElementById('modal');
  var link = document.getElementById('link');
  var copy = document.getElementById('copylink');
  var cancel = document.getElementById('cancel');

  socket.on('peer join', data => {
    console.log('PEER JOINED');
    modal.style.display = 'none';
    userFormArea.style.display = 'none';
    messageArea.style.display = 'flex';
    currentRoom = data.roomId;
    isPublic = data.isPublic;
  });

  socket.on('prompt username')

  console.log(currentRoom);
  if (!currentRoom && location.pathname !== '/') {
    console.log(currentRoom);
  } else if (location.pathname === '/public') {
    modal.style.display = 'none';
  } else if (location.pathname === '/') {
    // login page
    console.log('login');
    go.disabled = true;

    modal.style.display = 'none';
    messageArea.style.display = 'none';

    public.addEventListener('click', () => {
      isPublic = true;
      console.log(isPublic);
      public.classList.add('selected');
      private.classList.remove('selected');
      go.disabled = false;
    });

    private.addEventListener('click', () => {
      isPublic = false;
      console.log(isPublic);
      private.classList.add('selected');
      public.classList.remove('selected');
      go.disabled = false;
    });

    username.addEventListener('keypress', e => {
      if (e.keyCode === 13) {
        e.preventDefault();
      }
    });

    userForm.addEventListener('submit', e => {
      e.preventDefault();

      name = username.value.replace(/\s+/g, '');

      if (name.length < 4) {
        alert('Username too short!');
        return;
      }
      socket.emit('new user', name, callback => {
        if (callback) {
          socket.emit('join room', isPublic);
        } else {
          alert('Username is already in use!');
        }
      });
      username.value = '';
    });
  }

  //  Regex for 6 digit alphanumeric
  // ^[\p{L}\p{N}]{6,}$

  cancel.addEventListener('click', () => {
    window.open('https://chappio.herokuapp.com/', '_self');
  });

  copy.addEventListener('click', () => {
      link.select();
      document.execCommand('copy');
      copy.innerHTML = '<i class="fas fa-check"></i>';
  });

  socket.on('full room', () => {
    console.log('ROOM IS FULL');
  });

  socket.on('redirect', room => {
    currentRoom = room;
    if (isPublic) {
      history.pushState(null, '', `/public`);
    } else {
      history.pushState(null, '', `/${room}`);
      modal.style.display = 'block';
      link.value = `http://chappio.herokuapp.com/${room}`;
    }
    userFormArea.style.display = 'none';
    messageArea.style.display = 'flex';
  });

  if (messageArea) {
    // submit message with enter key
    messageForm.addEventListener('keypress', e => {
      validMessage = message.value === '' ? false : true;

      if (e.keyCode === 13 && validMessage) {
        e.preventDefault();
        socket.emit('send message', message.value, currentRoom);
        message.value = '';
      } else if (e.keyCode === 13) {
        e.preventDefault();
      }
    });

    // submit message button
    messageForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validMessage) return false;
      socket.emit('send message', message.value, currentRoom);
      message.value = '';
    });
  }

  socket.on('get users', data => {
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += `<li>${data[i]}</li>`;
    }
    users.innerHTML = html;
  });

  socket.on('new message', data => {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var period = '';

    if (h >= 12) {
      h -= 12;
      period = 'PM';
    } else {
      period = 'AM';
    }

    h = h.toString();

    if (m < 10) {
      m = m.toString();
      m = `0${m}`;
    } else {
      m = m.toString();
    }
    chat.innerHTML += `<li><span style="font-family:'Russo One',sans-serif;">${
      data.user
    }</span> <span style="font-size:11px;color:grey;font-family:'Roboto Mono',monospace;" >at ${h}:${m} ${period}</span><br /> ${
      data.msg
    }</li><br />`;

    scrollToBottom();
  });

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }
});
