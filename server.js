const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
const mysql = require('mysql')

const app = express();
const server = http.createServer(app)
const io = socket(server);
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//connect to database
const conn = mysql.createConnection({
     host: "localhost",
     user: "root",
     password: "",
     database: "chatcord"
})


//Insert Room Functio
function addroom(room) {
     const sql = `INSERT INTO rooms(name) VALUES('${room}')`

     conn.connect(function (err) {
          if (err) console.log(err)
          console.log("Connected")
          console.log("Inserting")

          conn.query(sql, function (err, result) {
               if (err) throw err
               console.log("Inserted")
          })
     })
}

const botName = 'ChatCord Bot'
// run when client connects
io.on('connect', (socket) => {

     socket.on('joinRoom', ({ username, room }) => {

          const user = userJoin(socket.id, username, room)

          socket.join(user.room);

          //welcome current user
          socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

          //Broadcast when a user connects
          socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} Has Joined a chat`));

          //send user room and user info
          io.to(user.room).emit('roomUsers', {
               room: user.room,
               users: getRoomUsers(user.room),
          })
     })

     socket.on('visit', () => {
          console.log("visit")
          getrooms(socket);
     })

     //addroom to the db
     socket.on('addroom', (socket) => {
          addroom(socket.room, socket);
     })

     //listen to chat message
     socket.on('chatMessage', msg => {
          const user = getCurrentUser(socket.id);

          io.to(user.room).emit('message', formatMessage(user.username, msg));
     })

     //when client disconnects
     socket.on('disconnect', () => {

          const user = userLeave(socket.id);
          if (user) {
               io.to(user.room).emit('message', formatMessage(botName, `${user.username} left the Chat`));
               io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room),
               })
          }
     })

     socket.on('deleteRoom', (id) => {
          console.log(id)
          sql = `DELETE FROM rooms WHERE id = ${id}`
          conn.query(sql, function (err, result) {
               if (err) console.log(err)
               console.log(`Deleted Room ${id} `, result)
          })
     })
})

//get rooms from database;
function getrooms(socket) {
     const sql = 'SELECT * FROM rooms'

     conn.connect(function (err) {
          if (err) console.log(err)
          console.log("Connected")
          console.log("getting rooms")

          conn.query(sql, function (err, result, fields) {
               if (err) console.log(err)
               console.log("emit rooms")
               socket.emit('getrooms', { result })
          })
     })
}

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on ${PORT}`))