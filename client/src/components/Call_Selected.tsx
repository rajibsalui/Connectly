"use client";
import React from "react";
import assets from "../assets/assets";
import { FiPhoneCall } from "react-icons/fi";
import { IoCallOutline, IoVideocamOutline } from "react-icons/io5";

interface Contact {
  id: number;
  name: string;
  avatar: string;
  outGoing: boolean;
  incoming: boolean;
  timestamp: string;
}

interface Call {
  id: number;
  avatar: string;
  duration: string;
  outGoing: boolean;
  incoming: boolean;
  timestamp: string;
}

interface Assets {
  chat_bg: string;
  gallery_icon: string;
  send_button: string;
}

interface CallSelectedProps {
  selectedChat: Contact;
  calls: Call[];
  assets: Assets;
}

const Call_Selected: React.FC<CallSelectedProps> = ({
  selectedChat,
  calls,
  assets,
}) => {
  return (
    <>
      <div className="p-4 border-b border-gray-300 bg-white">
        <div className="flex relative items-center space-x-4">
          <img
            src={selectedChat.avatar}
            alt={selectedChat.name}
            className="w-10 h-10 rounded-full"
          />
          <h2 className="font-semibold">{selectedChat.name}</h2>
          <div className="absolute right-12 text-2xl flex cursor-pointer space-x-10">
            <IoCallOutline className="cursor-pointer" />
            <IoVideocamOutline className="cursor-pointer" />
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url(${assets.chat_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {calls.length > 0 ? (
          calls.map((call) => (
            <div
              key={call.id}
              className={`flex relative w-full bg-zinc-300/15 rounded-xl mb-3`}
            >
              <div className={`flex max-w-[70%] p-3 rounded-lg`}>
                <div>
                  <FiPhoneCall className="text-2xl mt-1" />
                </div>

                <p className="text-md mt-1 ml-5 opacity-70">
                  {call.outGoing
                    ? "Outgoing Voice call at"
                    : "Incoming voice call at "}
                </p>
                <p className="text-md mt-1 ml-1 opacity-70">{call.timestamp}</p>
                <p className="absolute right-8 text-md">{call.duration}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No calls available</p>
        )}
      </div>
    </>
  );
};

export default Call_Selected;
