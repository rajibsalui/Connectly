'use client'
import React from 'react'
import assets from '../assets/assets'
import Image from 'next/image'

interface Contact {
  id: number;
  name: string;
  lastMessage: string;
  avatar: string;
  online: boolean;
}

interface ChatContactsProps {
  contact: Contact;
  selectedChat: Contact | null;
  setSelectedChat: (contact: Contact) => void;
}

const Chat_Contacts = ({ contact, selectedChat, setSelectedChat }: ChatContactsProps) => {
  return (
    <div
      onClick={() => setSelectedChat(contact)}
      className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${
        selectedChat?.id === contact.id ? "bg-gray-100" : ""
      }`}
    >
      <div className="relative">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-12 h-12 rounded-full"
        />
        {contact.online && (
          <div className="absolute bottom-0 right-0">
            <Image
              src={assets.green_dot}
              alt="online" 
              className="w-3 h-3"
              width={12}
              height={12}
            />
          </div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h3 className="font-semibold">{contact.name}</h3>
        <p className="text-sm text-gray-500">{contact.lastMessage}</p>
      </div>
    </div>
  )
}

export default Chat_Contacts