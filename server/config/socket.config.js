// server.js
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Map to store connected users

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user registration
    socket.on('register', (username) => {
        users[username] = socket.id;
        socket.username = username;
        console.log(`User registered: ${username}`);
    });

    // Handle one-to-one chat messages
    socket.on('send-message', ({ recipient, message }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive-message', {
                sender: socket.username,
                message,
            });
        } else {
            console.log('Recipient not found');
        }
    });

    // Handle video call signaling (offer, answer, candidate)
    socket.on('call-user', ({ recipient, offer }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('incoming-call', {
                caller: socket.username,
                offer,
            });
        }
    });


    // Handle call answer from recipient to caller 
    socket.on('answer-call', ({ recipient, answer }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('call-answered', {
                answer,
            });
        }
    });

    // Handle ICE candidate exchange between caller and recipient
    socket.on('send-candidate', ({ recipient, candidate }) => {
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive-candidate', {
                candidate,
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.username];
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});