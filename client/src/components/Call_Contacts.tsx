'use client'
import assets from '@/assets/assets';
import Image from 'next/image';
import React from 'react'

interface Contact {
    id: number;
    name: string;
    avatar: string;
    outGoing: boolean;
    incoming: boolean;
    timestamp: string;
  }

interface CallContactsProps {
    contact: Contact;
    selectedChat: Contact | null;
    setSelectedChat: (contact: Contact) => void;
  }
const Call_Contacts = ({ contact, selectedChat, setSelectedChat }: CallContactsProps) => {
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
        {/* {contact.online && (
          <div className="absolute bottom-0 right-0">
            <Image
              src={assets.green_dot}
              alt="online" 
              className="w-3 h-3"
              width={12}
              height={12}
            />
          </div>
        )} */}
      </div>
      <div className="ml-4 flex-1 relative">
        <h3 className="font-semibold">{contact.name}</h3>
        <p className="text-sm text-gray-500">{contact.outGoing?"Outgoing":"Incomming"}</p>
        <p className="text-sm absolute right-1 top-1/2 text-gray-800">{contact.timestamp}</p>
      </div>
    </div>
  )
}

export default Call_Contacts