// server.js
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle chat message
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    // Handle video call signaling
    socket.on('video call', (signal) => {
        socket.broadcast.emit('video call', signal);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});