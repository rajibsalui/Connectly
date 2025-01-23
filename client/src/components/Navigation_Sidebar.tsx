'use client'

import React, { useState } from 'react'
import assets from '../assets/assets'
import {
  IoChatbubbleEllipsesOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdAddIcCall } from "react-icons/md";
import { LuMenu } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Navigation_Sidebar = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${isExpanded ? 'w-48' : 'w-20'} transition-width duration-300 bg-white border-r border-gray-300 flex flex-col items-center py-6`}>
      <div className="flex-1 p-2 flex-col items-center justify-center space-y-8 w-full">
        <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer" onClick={toggleSidebar}>
          <div className="flex items-center">
            <LuMenu className="text-3xl" />
            {isExpanded && <span className="ml-3">Menu</span>}
          </div>
        </div>
        <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer" onClick={() => router.push("/chat")}>
          <div className="flex items-center">
            <IoChatbubbleEllipsesOutline className="text-3xl" />
            {isExpanded && <span className="ml-3">Chat</span>}
          </div>
        </div>
        <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer">
          <div className="flex items-center" onClick={() => router.push("/status")}>
            <Image src={assets.help_icon} alt="Status" width={24} height={24} />
            {isExpanded && <span className="ml-3">Status</span>}
          </div>
        </div>
        <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer" onClick={() => router.push("/call")}>
          <div className="flex items-center">
            <MdAddIcCall className="text-3xl" />
            {isExpanded && <span className="ml-3">Call</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col p-2 space-y-6 w-full">
        <div className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer">
          <div className="flex items-center">
            <IoSettingsOutline className="text-3xl" />
            {isExpanded && <span className="ml-3">Settings</span>}
          </div>
        </div>
        <div className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer" onClick={() => router.push("/profile-update")}>
          <div className="flex items-center">
            <Image
              src={assets.profile_img}
              alt="Account" 
              width={40}
              height={40}
              className="rounded-full"
            />
            {isExpanded && <span className="ml-3">Profile</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation_Sidebar