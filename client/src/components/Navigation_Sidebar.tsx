"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  IoChatbubbleEllipsesOutline,
  IoSettingsOutline,
  IoColorPaletteOutline,
  IoPersonOutline,
  IoCallOutline,
  IoMenuOutline,
  IoEllipsisVertical,
  IoLogOutOutline
} from "react-icons/io5";
import ThemeSwitcher from "./ThemeSwitcher";
import ProfileUpdatePopup from "./ProfileUpdatePopup";
import SettingsPage from "./Setting_page";

const Navigation_Sidebar = () => {
  const router = useRouter();
  const { user, getUser, logout } = useAuth();

  const params = useParams();
  const userId = params?.userId as string;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    getUser(userId);
  }, [userId]);

  const handleLogout = async () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      icon: <IoChatbubbleEllipsesOutline className="w-6 h-6" />,
      label: "Chat",
      onClick: () => router.push(`/chat/${user?.id}`),
    },
    {
      icon: <IoCallOutline className="w-6 h-6" />,
      label: "Calls",
      onClick: () => router.push("/call"),
    },
    {
      icon: <IoColorPaletteOutline className="w-6 h-6" />,
      label: "Theme",
      onClick: () => {
        setShowThemeMenu(true)
        router.push("/theme")
      },
    },
    {
      icon: <IoPersonOutline className="w-6 h-6" />,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
    {
      icon: <IoSettingsOutline className="w-6 h-6" />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
  ];

  return (
    <div
      className={`
        ${isExpanded ? "w-64" : "w-20"} 
        transition-all duration-300 ease-in-out
        min-h-screen bg-base-200/50 backdrop-blur-md
        border-r border-base-300
        flex flex-col items-center
        fixed left-0 top-0
        z-50
      `}
    >
      {/* Top Section */}
      <div className="w-full p-4 flex flex-col items-center space-y-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-ghost btn-circle"
        >
          <IoMenuOutline className="w-6 h-6" />
        </button>

        <div className="relative flex flex-col items-center">
          <div className={` transition-all relative ${isExpanded ? 'mb-3 w-16 h-16' : ' w-12 h-12'}`}>
            <Image
              src={user?.avatar || "/default-avatar.png"}
              alt="Profile"
              fill
              sizes="(max-width: 64px) 100vw"
              className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 object-cover"
            />
          </div>
          {isExpanded && (
            <div className="text-center">
              <p className="font-medium text-base">{user?.firstName}</p>
              <p className="text-sm text-base-content/60">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 w-full px-3 py-8 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`
              btn btn-ghost w-full justify-start gap-3
              ${isExpanded ? "px-4" : "px-2"}
              hover:bg-base-300/50
            `}
          >
            {item.icon}
            {isExpanded && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="w-full px-3 pb-6">
        <button
          onClick={handleLogout}
          className={`
            btn btn-ghost w-full justify-start gap-3 text-error
            ${isExpanded ? "px-4" : "px-2"}
            hover:bg-error/10
          `}
        >
          <IoLogOutOutline className="w-6 h-6" />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Navigation_Sidebar;
