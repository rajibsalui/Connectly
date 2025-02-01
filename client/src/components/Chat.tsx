'use client'
import React, { useEffect, useState } from "react";
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
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  onlineStatus: boolean;
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
  const { user, getContacts, getUser , contacts } = useAuth();
  // const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
   const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(()=>{
    console.log(user)
    const token = localStorage.getItem('token');
    if(token){
      setIsAuthenticated(true);
    }
    else{
      router.push('/login');
    }
    // const fetchContacts = async () => {
    //   try {
    //     if (user?._id) {
    //       const fetchedContacts = await getContacts(user._id);
    //       console.log(fetchedContacts)
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch contacts:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // fetchContacts();
  }, [user]);

  

  const handleChatSelect = (contact: Contact) => {
    setSelectedChat(selectedChat?._id === contact._id ? null : contact);
  };

  const chatAssets = {
    chat_bg: assets.chat_bg.src,
    gallery_icon: assets.gallery_icon.src,
    send_button: assets.send_button.src
  };

  return (
    <>
      {isAuthenticated ? <>
        <div className="flex h-screen">
      {/* Navigation Sidebar */}
      <Chat_Navigation_Sidebar />

      {/* Left Sidebar */}
      <div className="w-1/4 border-r box5 ">
        <Chat_Search />
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {contacts.map((contact: Contact) => (
            <Chat_Contacts
              key={contact._id}
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
      </>:null}
    </>
    
  );
};

export default Chat;
