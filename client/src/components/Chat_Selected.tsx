'use client'
import React, { useState } from "react";
import { FaPhoneAlt, FaVideo } from 'react-icons/fa'; // Importing React icons
import { useRouter } from 'next/navigation';
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";

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

interface Assets {
  chat_bg: string;
  gallery_icon: string;
  send_button: string;
}

interface ChatSelectedProps {
  selectedChat: Contact;
  messages: Message[];
  onSendMessage: (content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  assets: Assets;
  currentUserId: string;
}

const MessageStatus = ({ message, currentUserId }: { message: Message; currentUserId: string }) => {
  if (message.sender !== currentUserId) return null;
  
  return (
    <span className="ml-2 text-xs">
      {message.read ? (
        <span className="text-blue-500">✓✓</span>
      ) : message.delivered ? (
        <span className="text-gray-500">✓✓</span>
      ) : (
        <span className="text-gray-400">✓</span>
      )}
    </span>
  );
};

const Chat_Selected = ({ 
  selectedChat, 
  messages, 
  onSendMessage, 
  messagesEndRef,
  assets,
  currentUserId 
}: ChatSelectedProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCallWindow = () => {
    const callWindow = window.open(
      "/voice_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );
  };

  const openVideoCallWindow = () => {
    const videoCallWindow = window.open(
      "/video_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );

  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <div className="p-4 border-b box5 ">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <img
              src={selectedChat.photoURL}
              alt={`${selectedChat.displayName}`}
              className="w-10 h-10 rounded-full"
            />
            <h2 className="font-semibold ">{`${selectedChat.displayName}`}</h2>
          </div>
          <div className="flex space-x-10 px-6">
            <IoCallOutline onClick={openCallWindow} className="w-6 h-6 cursor-pointer hover:scale-110 transition-all" title="Voice Call" />
            <IoVideocamOutline onClick={openVideoCallWindow} className="w-6 h-6 cursor-pointer hover:scale-110 transition-all" title="Video Call" />
          </div>
        </div>
      </div>
      <div
        className="flex-1 box1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: `url(${assets.chat_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender === currentUserId ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === currentUserId 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-800"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-end mt-1">
                <p className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </p>
                <MessageStatus message={message} currentUserId={currentUserId} />
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t box5">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <img
            src={assets.gallery_icon}
            alt="Add"
            className="w-6 h-6 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-transparent"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">
            <img
              src={assets.send_button}
              alt="Send"
              className="w-6 h-6 cursor-pointer"
            />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chat_Selected;
