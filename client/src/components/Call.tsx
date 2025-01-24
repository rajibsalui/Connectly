"use client";
import React, { useState } from "react";
import Navigation_Sidebar from "./Navigation_Sidebar";
import assets from "../assets/assets";
import Call_Search from "./Call_Search";
import Call_Contacts from "./Call_Contacts";
import Call_Selected from "./Call_Selected";
import { FcVideoCall } from "react-icons/fc";
import { PiNumpadLight } from "react-icons/pi";
import Image from "next/image";

const chatAssets = {
  chat_bg: assets.chat_bg.src,
  gallery_icon: assets.gallery_icon.src,
  send_button: assets.send_button.src,
};

interface Contact {
  id: number;
  name: string;
  avatar: string;
  outGoing: boolean;
  incoming: boolean;
  timestamp: string;
}

interface Call {
  id: number;
  avatar: string;
  duration: string;
  outGoing: boolean;
  incoming: boolean;
  timestamp: string;
}

const contacts: Contact[] = [
  {
    id: 1,
    name: "John Doe",
    avatar: assets.avatar_icon.src,
    outGoing: true,
    incoming: false,
    timestamp: "10:00 AM",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: assets.avatar_icon.src,
    outGoing: false,
    incoming: true,
    timestamp: "12:00 AM",
  },
  {
    id: 3,
    name: "Alice Johnson",
    avatar: assets.avatar_icon.src,
    outGoing: true,
    incoming: false,
    timestamp: "10:00 PM",
  },
  {
    id: 4,
    name: "Bob Brown",
    avatar: assets.avatar_icon.src,
    outGoing: false,
    incoming: true,
    timestamp: "1:00 PM",
  },
];

const calls: { [key: number]: Call[] } = {
  1: [
    {
      id: 1,
      avatar: assets.avatar_icon.src,
      duration: "2:15",
      outGoing: true,
      incoming: false,
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      avatar: assets.avatar_icon.src,
      duration: "5:45",
      outGoing: false,
      incoming: true,
      timestamp: "11:00 AM",
    },
  ],
  2: [
    {
      id: 1,
      avatar: assets.avatar_icon.src,
      duration: "3:30",
      outGoing: true,
      incoming: false,
      timestamp: "9:30 AM",
    },
    {
      id: 2,
      avatar: assets.avatar_icon.src,
      duration: "4:00",
      outGoing: false,
      incoming: true,
      timestamp: "10:00 AM",
    },
  ],
  3: [
    {
      id: 1,
      avatar: assets.avatar_icon.src,
      duration: "1:45",
      outGoing: true,
      incoming: false,
      timestamp: "11:00 AM",
    },
    {
      id: 2,
      avatar: assets.avatar_icon.src,
      duration: "2:30",
      outGoing: false,
      incoming: true,
      timestamp: "11:30 AM",
    },
  ],
  4: [
    {
      id: 1,
      avatar: assets.avatar_icon.src,
      duration: "3:15",
      outGoing: true,
      incoming: false,
      timestamp: "1:00 PM",
    },
    {
      id: 2,
      avatar: assets.avatar_icon.src,
      duration: "4:45",
      outGoing: false,
      incoming: true,
      timestamp: "1:30 PM",
    },
  ],
};

const Call: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);

  const handleChatSelect = (contact: Contact) => {
    if (selectedChat?.id === contact.id) {
      setSelectedChat(null);
    } else {
      setSelectedChat(contact);
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <Navigation_Sidebar />
        <div className="w-1/4 border-r border-gray-300 bg-white">
          <Call_Search />
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {contacts.map((contact: Contact) => (
              <Call_Contacts
                key={contact.id}
                contact={contact}
                selectedChat={selectedChat}
                setSelectedChat={handleChatSelect}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <Call_Selected
              selectedChat={selectedChat}
              calls={calls[selectedChat.id]}
              assets={chatAssets}
            />
          ) : (
            <div className="flex-1 flex space-x-5 items-center justify-center bg-gray-50">
              <Image
                src={assets.chat_bg}
                alt="bg1"
                className="w-full -z-10 h-screen object-cover fixed top-0 left-0"
                priority
              />
              <div className="text-6xl flex flex-col items-center justify-center bg-zinc-300/20 rounded-lg p-3 text-gray-800">
                <FcVideoCall className="" />
                <p className="text-lg font-semibold">Start a Call</p>
              </div>
              <div className="text-6xl flex flex-col items-center justify-center bg-zinc-300/20 rounded-lg p-3 text-gray-800">
                <PiNumpadLight />
                <p className="text-lg font-semibold">Call a Number</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Call;
