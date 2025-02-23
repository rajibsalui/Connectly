import express from 'express';
import { 
  createOrGetChat, 
  getMessages, 
  getUserChats,
  deleteChat,
  saveMessage 
} from '../controllers/chat.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Chat routes
router.post('/', authMiddleware, createOrGetChat);
router.get('/:chatId/get_messages', authMiddleware, getMessages);
router.get('/user/:userId', authMiddleware, getUserChats);
router.delete('/:chatId', authMiddleware, deleteChat);
router.post('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const message = await saveMessage(req.params.chatId, {
      sender: req.user.id,
      content: req.body.content
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
