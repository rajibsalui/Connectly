import Chat from '../models/chat.model.js';
import mongoose from 'mongoose';

// Create a new chat
export const createChat = async (req, res) => {
  const { participants } = req.body; // Expecting an array of user IDs

  try {
    const newChat = new Chat({ participants });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this chat' });
    }

    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChat:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'displayName email photoURL')
      .populate({
        path: 'messages',
        options: { sort: { timestamp: -1 }, limit: 1 },
        populate: {
          path: 'sender',
          select: 'displayName email photoURL'
        }
      })
      .sort({ 'lastMessage': -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error in getUserChats:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] }
    })
    .populate('participants', 'displayName email photoURL')
    .populate({
      path: 'messages',
      populate: {
        path: 'sender',
        select: 'displayName email photoURL'
      }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, participantId],
        messages: []
      });
      chat = await chat.populate([
        { path: 'participants', select: 'displayName email photoURL' }
      ]);
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error in createOrGetChat:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId)
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

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: error.message });
  }
};

export const saveMessage = async (chatId, messageData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new Error('Invalid chat ID');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    const newMessage = {
      sender: messageData.sender,
      content: messageData.content,
      timestamp: new Date(),
      read: false,
      delivered: true
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      content: messageData.content,
      sender: messageData.sender,
      timestamp: new Date()
    };

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate({
        path: 'messages.sender',
        select: 'displayName email photoURL'
      })
      .populate({
        path: 'lastMessage.sender',
        select: 'displayName email photoURL'
      });

    return updatedChat.messages[updatedChat.messages.length - 1];
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
