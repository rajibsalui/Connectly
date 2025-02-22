'use client'
import React from 'react'
import Image from 'next/image'
import assets from '../assets/assets'

interface Contact {
  _id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  onlineStatus?: boolean;
  lastMessage?: string;
}

interface ChatContactsProps {
  contact: Contact;
  selectedChat: Contact | null;
  setSelectedChat: (contact: Contact) => void;
}

const Chat_Contacts = ({ contact, selectedChat, setSelectedChat }: ChatContactsProps) => {
  const fullName = `${contact.displayName}`;
  
  
  return (
    <div
      onClick={() => setSelectedChat(contact)}
      className={`flex box3 relative items-center transition-all m-2 p-4 rounded-xl cursor-pointer ${
        selectedChat?._id === contact._id ? "box2" : ""
      }`}
    >
      {selectedChat?._id === contact._id && (
        <div className="bg-green-400 absolute h-6 w-[2.8px] left-[5px] top-7" />
      )}
      
      <div className="relative">
        <Image
          src={contact.photoURL || assets.profile_img}
          alt={fullName}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        {contact.onlineStatus && (
          <div className="absolute bottom-0 right-0">
            <Image
              src={assets.green_dot}
              alt="online"
              width={12}
              height={12}
              className="w-3 h-3"
            />
          </div>
        )}
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-sm">{fullName}</h3>
        <p className="text-sm text-gray-500 truncate">
          {contact.lastMessage || 'Start a conversation'}
        </p>
      </div>
    </div>
  )
}

export default Chat_Contacts