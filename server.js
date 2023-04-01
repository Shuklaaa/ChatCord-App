const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin, 
    getCurrentUser, 
    userLeave, 
    getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// RUN WHEN USER CONNECTS
io.on('connection', socket=>{
    socket.on('joinRoom', ({username, room}) =>{
        // console.log('NEW CONNECTION....');
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

    // WELCOME CURRENT USER
    socket.emit('message', formatMessage(botName, 'WELCOME TO CHATCORD'));

    // Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit(
        'message', 
        formatMessage(botName, `${user.username} has joined the chat`)
        );  //diiff between this and socket.emit is htat it will show everyone except the user

        // SEND USERS AND ROOM INFO
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    

    

    // LISTEN FOR CHAT MESSAGES
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        // console.log(msg);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit(
                'message', 
                formatMessage(botName,`${user.username} has left the chat`)
                );

                // SEND USERS AND ROOM INFO
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }

    });

});

const  PORT = 3000 || process.env.PORT; //process.env.PORT means either it will run on port 300 or it will look for process enviroenmwnt variable PORT

server.listen(PORT, ()=> console.log(`Server running on port${PORT}`));