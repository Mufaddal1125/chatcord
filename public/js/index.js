document.addEventListener("DOMContentLoaded", () => {
     const socket = io();
     const rooms = []
     const addroom = document.querySelector(".addroom");

     socket.emit('visit', {})

     socket.on('getrooms', (room) => {
          console.log(room.result)
          room.result.forEach(element => {
               room = { id: element.id, name: element.name }
               console.log(room)
               rooms.push(room)
          });
          appendRoom(rooms)
     })

     addroom.addEventListener('submit', e => {
          var room = document.querySelector('#add').value;
          socket.emit('addroom', { room })
          alert(`Added Room ${room}`)
     })
})

function appendRoom(rooms) {
     rooms.forEach(room => {
          options = `<option value='{"id":${room.id}, "name":"${room.name}"}'>${room.name}</option>`
          options.innerHTML = `${room}`;
          $("#room").append(options);
     });
}