'use client'
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import assets from "../assets/assets";
import Chat_Navigation_Sidebar from "./Navigation_Sidebar";
import Chat_Contacts from "./Chat_Contact";
import Chat_Selected from "./Chat_Selected";
import Chat_Search from "./Chat_Search";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { config } from '../config/config';

interface Contact {
  _id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  onlineStatus?: boolean;
  lastMessage?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
}

const Chat = () => {
  const { user, getContacts, contacts } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    const newSocket = io(config.socketUrl, {
      auth: { token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [router]);

  // Handle socket events
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('setup', user._id);

      socket.on('message received', (data) => {
        if (data.chatId === chatId) {
          setMessages(prev => [...prev, data.message]);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      });

      return () => {
        socket.off('message received');
      };
    }
  }, [socket, user, chatId]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        if (user?._id) {
          await getContacts(user._id);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      fetchContacts();
    }
  }, [user]);

  const handleChatSelect = async (contact: Contact) => {
    try {
      setSelectedChat(contact);
      setIsLoading(true);

      const response = await fetch(`${config.serverUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ participantId: contact._id })
      });

      const data = await response.json();
      setChatId(data._id);
      
      if (socket) {
        socket.emit('join chat', data._id);
      }

      // Set initial messages from the chat data
      setMessages(data.messages || []);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!socket || !chatId || !user?._id) return;
    const tempMessage = {
      _id: Date.now().toString(),
      content,
      sender: user._id,
      timestamp: new Date(),
      read: false,
      delivered: false
    };
    try {
      // const tempMessage = {
      //   _id: Date.now().toString(),
      //   content,
      //   sender: user._id,
      //   timestamp: new Date(),
      //   read: false,
      //   delivered: false
      // };

      // Optimistically add message to UI
      setMessages(prev => [...prev, tempMessage]);

      // Send message to server
      socket.emit('new message', {
        chatId,
        content,
        sender: user._id
      }, (error: any) => {
        if (error) {
          console.error('Message error:', error);
          setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        }
      });

      // Listen for server acknowledgment
      socket.on('message received', (data) => {
        if (data.chatId === chatId) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempMessage._id ? data.message : msg
            )
          );
        }
      });

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message from UI
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const handleSendMessage = async (message: Message) => {
    if (!socket || !chatId || !user?._id) return;

    try {
      // Emit the saved message through socket
      socket.emit('new message', {
        chatId,
        messageId: message._id,
        content: message.content,
        sender: user._id
      });

      setMessages(prev => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const chatAssets = {
    chat_bg: assets.chat_bg.src,
    gallery_icon: assets.gallery_icon.src,
    send_button: assets.send_button.src
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <Chat_Navigation_Sidebar />
      
      <div className="w-1/4 border-r box5">
        <Chat_Search />
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            contacts.map((contact: Contact) => (
              <Chat_Contacts
                key={contact._id}
                contact={contact}
                selectedChat={selectedChat}
                setSelectedChat={handleChatSelect}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <Chat_Selected
            selectedChat={selectedChat}
            messages={messages}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
            assets={chatAssets}
            currentUserId={user?._id}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
