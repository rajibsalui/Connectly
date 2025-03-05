"use client";
import React, { useState } from "react";
import { IoSearchOutline, IoAddOutline } from "react-icons/io5";
import AddContactPopup from "./Add_Contact";

const Chat_Search = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 border-b border-base-300 bg-base-200/50 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="input input-bordered w-full pl-12 py-3 bg-base-100/50 focus:bg-base-100 transition-colors duration-200"
          />
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-circle hover:btn-primary-focus transition-all duration-200"
          title="Add New Contact"
        >
          <IoAddOutline className="w-6 h-6" />
        </button>
      </div>

      {/* Popup rendered at root level */}
      <AddContactPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default Chat_Search;
