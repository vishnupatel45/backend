const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Create an Express application
const app = express();
app.use(cors());
app.use(bodyparser.json());

// Create an HTTP server and attach Express to it
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
const io = new Server(server, { cors: { origin: "*" } });

// Map to store email to socket ID mappings
var mailtosocketmap = new Map();
var sockettoemailmap = new Map();

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('new connection');
    
    socket.on('join-room', (data) => {
        const { email, roomId } = data;
        console.log('user', email, 'roomid', roomId);
        mailtosocketmap.set(email, socket.id);
        sockettoemailmap.set(socket.id, email);
        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        socket.broadcast.to(roomId).emit('user-join', { email });
    });

    socket.on('call-user', (data) => {
        const { email, offer } = data;
        const fromemail = sockettoemailmap.get(socket.id);
        const socketid = mailtosocketmap.get(email);
        socket.to(socketid).emit('incoming-call', { from: fromemail, offer });
    });

    socket.on('call-accepted', (data) => {
        const { email, ans } = data;
        const socketid = mailtosocketmap.get(email);
        socket.to(socketid).emit('call-accepted', { ans });
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

app.get('/vishnu',(req,res)=>{
    res.send(<h2>Hello vishnu !</h2>)
})

// Define the port to listen on
const PORT = 8000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
