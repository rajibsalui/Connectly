'use client'
import React from "react";
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
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

interface Messages {
  [key: number]: Message[];
}

interface Assets {
  chat_bg: string;
  gallery_icon: string;
  send_button: string;
}

interface ChatSelectedProps {
  selectedChat: Contact;
  messages: Messages;
  assets: Assets;
}

const Chat_Selected = ({ selectedChat, messages, assets }: ChatSelectedProps) => {
  const router = useRouter();
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
        className="flex-1 box1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url(${assets.chat_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* {messages[selectedChat.id].map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "me" ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === "me" ? "box2" : "box1"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
            </div>
          </div>
        ))} */}
      </div>
      <div className="p-4 border-t box5">
        <div className="flex items-center space-x-4">
          <img
            src={assets.gallery_icon}
            alt="Add"
            className="w-6 h-6 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-transparent"
          />
          <img
            src={assets.send_button}
            alt="Send"
            className="w-6 h-6 cursor-pointer"
          />
        </div>
      </div>
    </>
  );
};

export default Chat_Selected;
