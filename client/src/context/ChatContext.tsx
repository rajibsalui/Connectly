'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { config } from '../config/config';

interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  chatId: string;
  createdAt: Date;
  read: boolean;
  delivered: boolean;
}

interface MessageContent {
  content: string;
  sender: string;
  receiver: string;
}

interface ChatContextType {
  messages: Message[];
  getMessages: (chatId: string) => Promise<Message[]>;
  sendMessage: (messageContent: MessageContent) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<Message>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markMessageAsDelivered: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  getMessages: async () => [],
  sendMessage: async () => ({} as Message),
  deleteMessage: async () => {},
  updateMessage: async () => ({} as Message),
  markMessageAsRead: async () => {},
  markMessageAsDelivered: async () => {}
});

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

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

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
      // console.log(data)
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

      const response = await fetch(`${config.serverUrl}/messages/send/${messageContent.receiver}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageContent)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      console.log(newMessage)
      setMessages(prev => [...prev, newMessage.message]);
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
        throw new Error('Failed to update message');
      }

      const updatedMessage = await response.json();
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

  const value = {
    messages,
    getMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
    markMessageAsRead,
    markMessageAsDelivered
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
