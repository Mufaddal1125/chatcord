document.addEventListener("DOMContentLoaded", () => {
     const socket = io();

     const chatForm = document.getElementById('chat-form');
     const chatMessages = document.querySelector('.chat-messages');
     const roomName = document.getElementById('room-name');
     const userList = document.getElementById('users');
     const deleteRoombutton = document.getElementById('deleteRoom');


     //get username and room from url
     let { username, room } = Qs.parse(location.search, {
          ignoreQueryPrefix: true
     })
     room = JSON.parse(room)
     console.log(room)

     //get room and users
     socket.on('roomUsers', ({ room, users }) => {
          room = room
          outputRoomName(room.name);
          outputUsers(users);
     })

     //join chatroom
     socket.emit('joinRoom', { username, room })

     socket.on('message', (message) => {
          console.log(message);

          outPutMessage(message);

          //scroll down to new message
          chatMessages.scrollTop = chatMessages.scrollHeight;
     })


     //message submit
     chatForm.addEventListener('submit', (e) => {
          e.preventDefault();
          //get message text
          const msg = e.target.elements.msg.value;

          //emit message to server
          socket.emit('chatMessage', msg);

          //clear input
          e.target.elements.msg.value = '';
          e.target.elements.msg.focus();

     })

     deleteRoombutton.addEventListener("click", () => deleteRoom(room.id))

     function outPutMessage(msg) {
          const div = document.createElement('div');
          div.classList.add('message');
          div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
     <p class="text">
         ${msg.textmessage}
     </p>`;

          document.querySelector('.chat-messages').appendChild(div);
     }

     function deleteRoom(id) {
          console.log("deleteRoom " + id)
          socket.emit('deleteRoom', id)
     }

     function outputRoomName(room) {
          roomName.innerHTML = room;
     }

     function outputUsers(users) {
          userList.innerHTML = `
          ${users.map(user => `<li>${user.username}</li>`).join('')}
     `
     }
})