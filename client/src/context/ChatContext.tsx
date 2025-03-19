'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { config } from '../config/config';
import { useSocket } from './SocketContext';

interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  chatId: string;
  createdAt: Date;
  read: boolean;
  delivered: boolean;
  deletedFor?: string[]; // Add this line
  reactions?: {
    type: string;
    users: string[];
  }[];
}

interface MessageContent {
  content: string;
  sender: string;
  receiver: string;
  messageType: string;
}

interface ChatContextType {
  messages: Message[];
  getMessages: (chatId: string) => Promise<Message[]>;
  sendMessage: (messageContent: MessageContent) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<Message>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markMessageAsDelivered: (messageId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addReaction: (messageId: string, reactionType: string) => Promise<void>;
  removeReaction: (messageId: string, reactionType: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Add check for client-side rendering
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (socket && !initialized) {
      // Initialize socket listeners here
      socket.on('connect', () => {
        setInitialized(true);
      });

      return () => {
        socket.off('connect');
        setInitialized(false);
      };
    }
  }, [socket, initialized]);

  if (!mounted) {
    return null; // or a loading state
  }

  const getMessages = async (chatId: string): Promise<Message[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }


      const response = await fetch(`${config.serverUrl}/messages/conversation/${chatId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      console.log(data.messages)
      setMessages(data.messages);
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const sendMessage = async (messageContent: MessageContent): Promise<Message> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const formData = new FormData();
      formData.append('content', messageContent.content);
      formData.append('messageType', messageContent.messageType);
      formData.append('sender', messageContent.sender);
  
      if (messageContent.file) {
        formData.append('file', messageContent.file);
      }
  
      const response = await fetch(`${config.serverUrl}/messages/send/${messageContent.receiver}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // No need for Content-Type, browser sets it automatically for FormData
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      const newMessage = await response.json();
      console.log(newMessage);
      setMessages(prev => [...prev, newMessage.message]);
      // console.log(messages)
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };
  

  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${config.serverUrl}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const updateMessage = async (messageId: string, content: string): Promise<Message> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${config.serverUrl}/messages/edit/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update message');
      }

      const { message: updatedMessage } = await response.json();

      // Update messages in state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? updatedMessage : msg
      ));

      return updatedMessage;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  };

  const markMessageAsRead = async (messageId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${config.serverUrl}/messages/read/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  const markMessageAsDelivered = async (messageId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${config.serverUrl}/messages/deliver/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as delivered');
      }

      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, delivered: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const response = await fetch(`${config.serverUrl}/messages/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(response)
      
      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }
  
      setMessages([]); // Clear messages for this chat
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  const addReaction = async (messageId: string, reactionType: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${config.serverUrl}/messages/reaction/${messageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction : reactionType })
      });

      if (!response.ok) throw new Error('Failed to add reaction');

      const { message: updatedMessage } = await response.json();
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? updatedMessage : msg
      ));
      console.log(messages)
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeReaction = async (messageId: string, reactionType: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(`${config.serverUrl}/messages/reactions/${messageId}/${reactionType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove reaction');
      }

      const { message: updatedMessage } = await response.json();

      // Update messages in state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? updatedMessage : msg
      ));

      // Listen for socket event for real-time updates
      socket?.on('message:reaction', ({ messageId, updatedMessage }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? updatedMessage : msg
        ));
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  // const updateMessageReactions = useCallback((messageId: string, reactions: any[]) => {
  //   setMessages(prev => prev.map(msg => 
  //     msg._id === messageId ? { ...msg, reactions } : msg
  //   ));
  // }, []);

  const value = {
    messages,
    getMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
    markMessageAsRead,
    markMessageAsDelivered,
    deleteChat,
    addReaction,
    removeReaction
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
