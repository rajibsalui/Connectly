"use client";
import React from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
  const openCallWindow = () => {
    const callWindow = window.open(
      "/voice_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );
  };

  const openVideoCallWindow = () => {
    const videoCallWindow = window.open(
      "/video_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );

  };

  return (
    <>
      <div className="p-4 border-b box5">
        <div className="flex relative items-center space-x-4">
          <img
            src={selectedChat.avatar}
            alt={selectedChat.name}
            className="w-10 h-10 rounded-full"
          />
          <h2 className="font-semibold">{selectedChat.name}</h2>
          <div className="absolute right-12 text-2xl flex cursor-pointer space-x-10">
            <IoCallOutline onClick={openCallWindow} className="w-6 h-6 cursor-pointer hover:scale-110 transition-all" title="Voice Call" />
            <IoVideocamOutline onClick={openVideoCallWindow} className="w-6 h-6 cursor-pointer hover:scale-110 transition-all" title="Video Call" />
          </div>
        </div>
      </div>
      <div
        className="flex-1 box1 overflow-y-auto p-4"
        style={{
          backgroundImage: `url(${assets.chat_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {calls &&
          calls.map((call) => (
            <div
              key={call.id}
              className={`flex relative w-full box1  rounded-xl mb-3`}
            >
              <div className={`flex  max-w-[70%] p-3 rounded-lg `}>
                <div>
                  <FiPhoneCall className="text-2xl mt-1" />
                </div>

                <p className="text-md mt-1 ml-5">
                  {call.outGoing
                    ? "Outgoing Voice call at"
                    : "Incoming voice call at "}
                </p>
                <p className="text-md mt-1 ml-1">{call.timestamp}</p>
                <p className="absolute right-8 text-md">{call.duration}</p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Call_Selected;
