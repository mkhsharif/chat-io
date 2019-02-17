// $(document).ready(function() {  });

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


  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('send message', message.value);
    message.value = '';
  });

  username.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });

  socket.on('new message', data => {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var period = '';
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    zone = zone.replace(/_/g, ' ');
    zone = zone.replace(/\//g, ', ');

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
    }</span> <span style="font-size:11px;color:grey;font-family:'Roboto Mono',monospace;" >at ${h}:${m} ${period} (${zone})</span><br /> ${
      data.msg
    }</li><br />`;
    scrollToBottom();
    console.log('height: ' + messageLog.scrollHeight);
    console.log('top: ' + messageLog.scrollTop);
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
        userFormArea.style.display = 'none';
        messageArea.style.display = 'flex';
      } else {
        alert('Username is already in use!');
      }
    });
    username.value = '';
  });

  socket.on('get users', data => {
    var html = '';
    for (i = 0; i < data.length; i++) {
      html += `<li>${data[i]}</li>`;
    }
    users.innerHTML = html;
  });

  function scrollToBottom() {
    // $messageLog.scrollTop = $messageLog.scrollHeight;
  }
});
