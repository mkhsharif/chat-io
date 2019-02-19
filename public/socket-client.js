// $(document).ready(function() {  });

var validMessage = false;
var isPublic = null;
var room = '';

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

  if (!(window.location.href.indexOf('private') > -1)) {

    go.disabled = true;

    public.addEventListener('click', () => {
      isPublic = true;
      console.log(publicChat);
      public.classList.add('selected');
      private.classList.remove('selected');
      go.disabled = false;
    });

    private.addEventListener('click', () => {
      isPublic = false;
      console.log(publicChat);
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

      console.log(name);
      if (name.length < 4) {
        alert('Username too short!');
        return;
      }
      socket.emit('new user', name, data => {
        if (data) {
          if (!isPublic) {
            //modal.style.display = "block";
            modal[0].value = 'HELLO';
          } else {
            socket.emit('room', isPublic);
            console.log('here');
          }

          userFormArea.style.display = 'none';
          messageArea.style.display = 'flex';
          private.style.display = 'none';
        } else {
          alert('Username is already in use!');
        }
      });
      username.value = '';
    });
  } else {
    messageArea.style.display = 'flex';
  }

  // submit message enter
  messageForm.addEventListener('keypress', e => {
    // console.log(message.value);

    validMessage = message.value === '' ? false : true;

    if (e.keyCode === 13 && validMessage) {
      e.preventDefault();
      socket.emit('send message', message.value, room);
      message.value = '';
    } else if (e.keyCode === 13) {
      e.preventDefault();
    }
  });

  // submit message button
  //   messageForm.addEventListener('submit', e => {
  //     e.preventDefault();
  //     if (!validMessage) return false;
  //     socket.emit('send message', message.value, room);
  //     message.value = '';
  //   });

  socket.on('new message', data => {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var period = '';

    // var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // zone = zone.replace(/_/g, ' ');
    // zone = zone.replace(/\//g, ', ');

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

  socket.on('get users', data => {
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += `<li>${data[i]}</li>`;
    }
    users.innerHTML = html;
  });

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }
});
