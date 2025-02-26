import express from 'express';
import mongoose from 'mongoose';
import Chat from '../models/chat.model.js';
import { 
  createOrGetChat, 
  getMessages, 
  getUserChats,
  deleteChat,
  saveMessage 
} from '../controllers/chat.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { validateObjectId } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Chat routes
router.post('/', authMiddleware, createOrGetChat);

router.get('/:chatId/messages', 
  [authMiddleware, validateObjectId('chatId')], 
  getMessages
);

router.get('/user/:userId', 
  [authMiddleware, validateObjectId('userId')], 
  getUserChats
);

router.delete('/:chatId', 
  [authMiddleware, validateObjectId('chatId')], 
  deleteChat
);

// Save message route
router.post('/:chatId/messages', 
  [authMiddleware, validateObjectId('chatId')],
  async (req, res) => {
    try {
      const { content, receiverId } = req.body;
      
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required' });
      }

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid receiver ID' });
      }

      const message = await saveMessage(req.params.chatId, {
        sender: req.user.id,
        receiver: receiverId,
        content: content.trim()
      });

      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        // Emit to chat room
        io.to(req.params.chatId).emit('message received', {
          chatId: req.params.chatId,
          message
        });
        
        // Emit to receiver's personal room
        io.to(receiverId).emit('new message notification', {
          chatId: req.params.chatId,
          message
        });
      }

      res.status(201).json(message);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({ 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// Get chat by ID
router.get('/:chatId', 
  [authMiddleware, validateObjectId('chatId')],
  async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.chatId)
        .populate('participants', 'displayName email photoURL')
        .populate({
          path: 'messages',
          populate: {
            path: 'sender',
            select: 'displayName email photoURL'
          }
        });

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }

      // Check if user is a participant
      if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to access this chat' });
      }

      res.status(200).json(chat);
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
