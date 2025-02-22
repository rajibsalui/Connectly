'use client'
import React, { useState } from 'react'
import assets from '../assets/assets'
import AddContactPopup from './Add_Contact'

const Chat_Search = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 border-b box5">
      <div className="flex items-center space-x-4">
        {/* <img
          src={assets.profile_img}
          alt="Profile" 
          className="w-10 h-10 rounded-full"
        /> */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full p-2 rounded-lg box4"
          />
        </div>
      </div>
    {/* <button onClick={<Add_con} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition duration-200">
      <img src={assets.pic3.src} alt="Add Contact" className="w-6 h-6" />
    </button> */}
    <button onClick={() => setIsOpen(true)}>
      click me
    </button>
    <AddContactPopup isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    
    </div>
  )
}

export default Chat_Search