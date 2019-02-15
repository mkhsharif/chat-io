
// $(document).ready(function() {  });

$(function() {
    var socket = io.connect();

    // var element = document.getElementById('id');
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea =$('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');


    $messageForm.submit(e => {
        e.preventDefault();
        socket.emit('send message', $message.val());
        //getElementById(#id).value = '';
        $message.val('');
    });

    socket.on('new message', data => {
        $chat.append(`<div class="card card-body bg-light">${data.user}: ${data.msg}</div>`);
    });


    $userForm.submit(e => {
        e.preventDefault();
        socket.emit('new user', $username.val(), data => {
            if(data) {
                console.log($username.val());
                $userFormArea.css('display', 'none');
                $messageArea.css('display', 'flex');
            }
        });
        $username.val('');
    });

    socket.on('get users', data => {
        var html = '';
        console.log('HERE');
        for (i = 0; i < data.length; i++) {
            html += `<li class="list-group-item">${data[i]}</li>`;
        }
         // document.getElementById('users').innerHTML = html;
        $users.html(html);
        console.log(html);
    });


});