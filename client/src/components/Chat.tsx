'use client'
import React, { useState } from "react";
import assets from "../assets/assets";
import {
  IoChatbubbleEllipsesOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdAddIcCall } from "react-icons/md";
import Chat_Navigation_Sidebar from "./Navigation_Sidebar";
import Chat_Contacts from "./Chat_Contact";
import Chat_Selected from "./Chat_Selected";
import Chat_Search from "./Chat_Search";

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  online: boolean;
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

const contacts: Contact[] = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey there!",
    avatar: assets.avatar_icon.src,
    online: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    lastMessage: "How are you?",
    avatar: assets.avatar_icon.src,
    online: false,
  },
  {
    id: 3,
    name: "Mike Johnson",
    lastMessage: "See you later",
    avatar: assets.avatar_icon.src,
    online: true,
  },
];

const messages: Messages = {
  1: [
    { id: 1, text: "Hey there!", sender: "them", timestamp: "10:00 AM" },
    { id: 2, text: "Hi! How are you?", sender: "me", timestamp: "10:01 AM" },
  ],
  2: [
    { id: 1, text: "How are you?", sender: "them", timestamp: "9:30 AM" },
    { id: 2, text: "I'm good, thanks!", sender: "me", timestamp: "9:31 AM" },
  ],
  3: [
    { id: 1, text: "See you later", sender: "them", timestamp: "11:00 AM" },
    { id: 2, text: "Bye!", sender: "me", timestamp: "11:01 AM" },
  ],
};

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);

  const handleChatSelect = (contact: Contact) => {
    if (selectedChat?.id === contact.id) {
      setSelectedChat(null);
    } else {
      setSelectedChat(contact);
    }
  };

  const chatAssets = {
    chat_bg: assets.chat_bg.src,
    gallery_icon: assets.gallery_icon.src,
    send_button: assets.send_button.src
  };

  return (
    <div className="flex h-screen">
      {/* Navigation Sidebar */}
      <Chat_Navigation_Sidebar />

      {/* Left Sidebar */}
      <div className="w-1/4 border-r box5 ">
        <Chat_Search />
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {contacts.map((contact: Contact) => (
            <Chat_Contacts
              key={contact.id}
              contact={contact}
              selectedChat={selectedChat}
              setSelectedChat={handleChatSelect}
            />
          ))}
        </div>
      </div>

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <Chat_Selected
            selectedChat={selectedChat}
            messages={messages}
            assets={chatAssets}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center ">
            <p className="">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
