// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Chat from '../models/chat.model.js';
import { saveMessage } from '../controllers/chat.controller.js';

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

const app = express();
const server = http.createServer(app);

export const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    }
  });

  const users = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('setup', (userId) => {
      users.set(userId, socket.id);
      socket.join(userId);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User joined room:', room);
    });

    socket.on('typing', (room) => {
      socket.to(room).emit('typing');
    });

    socket.on('stop typing', (room) => {
      socket.to(room).emit('stop typing');
    });

    socket.on('new message', async (messageData) => {
      try {
        // Message is already saved, just emit to other participants
        io.to(messageData.chatId).emit('message received', {
          chatId: messageData.chatId,
          message: messageData
        });

        console.log('Message emitted:', messageData);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('message error', { 
          error: 'Failed to process message',
          details: error.message 
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      users.forEach((value, key) => {
        if (value === socket.id) {
          users.delete(key);
        }
      });
    });
  });

  return io;
};

const io = configureSocket(server);

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});