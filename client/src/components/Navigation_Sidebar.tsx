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
import ProfileUpdatePopup from './ProfileUpdatePopup'
import SettingsPage from './Setting_page';
import { TbCircleDashed } from 'react-icons/tb';

const Navigation_Sidebar = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${isExpanded ? 'w-60' : 'w-16'} transition-width duration-300 border-r box5 flex flex-col items-center py-6`}>
      <div className="flex-1 p-2 flex-col items-center justify-center space-y-8 w-full">
        <div className="p-3 box3 rounded-xl cursor-pointer transition duration-200" onClick={toggleSidebar}>
          <div className="flex items-center">
            <LuMenu className="text-3xl" />
            {isExpanded && <span className="ml-3 font-semibold ">Menu</span>}
          </div>
        </div>
        <div className="p-3 box3 rounded-xl cursor-pointer transition duration-200" onClick={() => router.push("/chat")}>
          <div className="flex items-center">
            <IoChatbubbleEllipsesOutline className="text-3xl" />
            {isExpanded && <span className="ml-3 font-semibold ">Chat</span>}
          </div>
        </div>
        <div className="p-3 box3 rounded-xl cursor-pointer transition duration-200" onClick={() => router.push("/status")}>
          <div className="flex items-center">
            <TbCircleDashed className="text-3xl" />
            {isExpanded && <span className="ml-3 font-semibold ">Status</span>}
          </div>
        </div>
        <div className="p-3 box3 rounded-xl cursor-pointer transition duration-200" onClick={() => router.push("/call")}>
          <div className="flex items-center">
            <MdAddIcCall className="text-3xl" />
            {isExpanded && <span className="ml-3 font-semibold ">Call</span>}
          </div>
        </div>
      </div>
      <div className="flex flex-col p-2 space-y-6 w-full">
        <div className="p-3 box3 rounded-xl cursor-pointer transition duration-200" onClick={() => <SettingsPage/>}>
          <div className="flex items-center">
            {/* <IoSettingsOutline className="text-3xl" /> */}
            <SettingsPage/>
            {isExpanded && <span className="ml-3 font-semibold ">Settings</span>}
          </div>
        </div>
        <div className="p-2 box3 rounded-xl cursor-pointer transition duration-200" onClick={() => <ProfileUpdatePopup/>}>
          <div className="flex items-center">
            <ProfileUpdatePopup/>
            {isExpanded && <span className="ml-3 font-semibold ">Profile</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation_Sidebar