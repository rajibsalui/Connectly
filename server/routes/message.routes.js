import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../utils/uploadFile.js';
import {
  sendMessage,
  getConversation,
  deleteMessage,
  markMessageAsRead,
  markMessageAsDelivered,
  editMessage,
  addReaction,
  removeReaction,
  replyToMessage,
  getUnreadMessages
} from '../controllers/message.controller.js';

const router = express.Router();

// Basic message operations
router.post('/send/:userId', protect, upload.single('file'), sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.delete('/:messageId', protect, deleteMessage);

// Message status
router.put('/read/:messageId', protect , markMessageAsRead);
router.put('/deliver/:messageId', protect, markMessageAsDelivered);
router.get('/unread', protect, getUnreadMessages);

// Message interactions
router.put('/edit/:messageId', protect, editMessage);
router.post('/reply/:messageId', protect, upload.single('file'), replyToMessage);
router.post('/reaction/:messageId', protect, addReaction);
router.delete('/reaction/:messageId', protect, removeReaction);

export default router;