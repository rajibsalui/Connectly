'use client'
import React from 'react'
import Image from 'next/image'
import assets from '../assets/assets'

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastMessage?: string;
}

interface ChatContactsProps {
  contact: Contact;
  selectedChat: Contact | null;
  setSelectedChat: (contact: Contact) => void;
}

const Chat_Contacts = ({ contact, selectedChat, setSelectedChat }: ChatContactsProps) => {
  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div
      onClick={() => setSelectedChat(contact)}
      className={`
        flex items-center gap-4
        px-6 py-4 mx-3 my-2
        rounded-2xl cursor-pointer
        transition-all duration-200 ease-in-out
        hover:bg-base-200/50
        relative
        ${selectedChat?._id === contact._id ? 
          "bg-primary/10 shadow-sm border border-primary/20" : 
          "hover:translate-x-1"
        }
      `}
    >
      <div className="relative flex-shrink-0">
        <div className={`
          ${selectedChat?._id === contact._id ? 
            "ring-2 ring-primary ring-offset-2" : ""
          }
          rounded-full overflow-hidden relative w-14 h-14
        `}>
          <Image
            src={contact.avatar || assets.profile_img}
            alt={fullName}
            fill
            sizes="(max-width: 64px) 100vw"
            className="rounded-full object-cover"
            style={{ zIndex: 1 }}
          />
        </div>
        {contact.isOnline && (
          <div className="absolute bottom-0 right-0 ring-2 ring-base-100 rounded-full" style={{ zIndex: 2 }}>
            <div className="w-3.5 h-3.5 bg-success rounded-full"></div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{fullName}</h3>
          <span className="text-xs text-base-content/60">12:30 PM</span>
        </div>
        <p className="text-sm text-base-content/70 truncate mt-0.5">
          {contact.lastMessage || 'Start a conversation'}
        </p>
      </div>
    </div>
  )
}

export default Chat_Contacts