import Chat from "../models/chat.model.js"; // Import the Chat model

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
  const { chatId } = req.params;

  try {
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found." });
    }
    res.status(200).json({ message: "Chat deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    const chats = await Chat.find({ participants: userId });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
