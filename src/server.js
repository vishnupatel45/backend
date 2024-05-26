const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors')
const {Server} = require('socket.io');

//app server
var io = new Server({cors:true,})
var app = express();
app.use(cors());
app.use(bodyparser.json());
// socket.io server  
var mailtosocketmap = new Map();
var sockettoemailmap = new Map();
io.on('connection',socket =>{
    console.log('new connection')
    socket.on('join-room',(data) =>{
        const { email, roomId} = data;
        console.log('user',email,'roomid',roomId); 
        mailtosocketmap.set(email,socket.id);
        sockettoemailmap.set(socket.id,email);
        socket.join(roomId);
        socket.emit('joined-room',{roomId});
        socket.broadcast.to(roomId).emit('user-join',{email});
    });

    socket.on('call-user',(data)=>{
        const {email,offer} = data;
        const fromemail = sockettoemailmap.get(socket.id);
        const socketid = mailtosocketmap.get(email);
        socket.to(socketid).emit('incoming-call',{from:fromemail,offer});
    });

    socket.on('call-accepted', (data) =>{
        const {email,ans} = data;
        const socketid = mailtosocketmap.get(email);
        socket.to(socketid).emit('call-accepted',{ans})
    });
    console.log('User connected:', socket.id);

    socket.on('send-message', (data) => {
        const { message } = data;
        socket.broadcast.emit('receive-message', { message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
 
//total parser

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// app.listen(8000, () => console.log('server is statred at port 8000'));
io.listen(8001);