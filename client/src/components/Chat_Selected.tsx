"use client";
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useChat } from "@/context/ChatContext";
import {
  IoCallOutline,
  IoVideocamOutline,
  IoImageOutline,
  IoSendSharp,
} from "react-icons/io5";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { config } from "../config/config";
import { useSocket } from "@/context/SocketContext";
import { FileInput } from "react-file-input";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastMessage?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  chatId: string;
  createdAt: Date;
  read: boolean;
  delivered: boolean;
  messageType?: "text" | "image" | "video";
  media?: string;
}

interface Assets {
  chat_bg: string;
  gallery_icon: string;
  send_button: string;
}

interface ChatSelectedProps {
  selectedChat: Contact;
  messages: Message[];
  onSendMessage: (
    content: string,
    messageType?: "text" | "image" | "video",
    media?: string
  ) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  assets: Assets;
  currentUserId: string;
}

const MessageStatus = ({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string;
}) => {
  if (message.sender !== currentUserId) return null;

  return (
    <span className="ml-2 text-xs">
      {message.read ? (
        <span className="text-primary">✓✓</span>
      ) : message.delivered ? (
        <span className="text-base-content/60">✓✓</span>
      ) : (
        <span className="text-base-content/40">✓</span>
      )}
    </span>
  );
};

const Chat_Selected = ({
  selectedChat,
  messages,
  onSendMessage,
  messagesEndRef,
  assets,
  currentUserId,
}: ChatSelectedProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("text");
  const { sendMessage, markMessageAsDelivered, getMessages } = useChat();
  const { user } = useAuth();
  const { socket, isTyping } = useSocket();
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  useEffect(() => {
    // console.log(selectedChat)
    // console.log(currentUserId)
  });

  const openCallWindow = () => {
    window.open(
      "/voice_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );
  };

  const openVideoCallWindow = () => {
    window.open(
      "/video_call",
      "_blank",
      "width=400,height=600,top=100,left=100"
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !file && isSubmitting) return;

    try {
      console.log(fileType);
      setIsSubmitting(true);
      const messageContent = {
        receiver: selectedChat._id,
        content: newMessage.trim(),
        sender: user.id,
        messageType: file ? fileType : "text",
        // type: fileType,
        file: file ? file : null,
      };
      const savedMessage = await sendMessage(messageContent);
      // console.log(savedMessage);
      onSendMessage(
        savedMessage.content,
        savedMessage.type,
        savedMessage.media
      );
      setIsUserTyping(false);
      socket?.emit("typing:stop", selectedChat._id);
      // Mark message as delivered
      if (savedMessage._id) {
        await markMessageAsDelivered(savedMessage._id);
      }

      // Emit message to the receiver
      if (socket) {
        socket.emit("message:send", {
          receiverId: selectedChat._id,
          message: {
            ...messageContent,
            createdAt: new Date(),
          },
        });
      }

      getMessages(selectedChat._id); // ✅ Update chat dynamically
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      setNewMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTyping = useCallback(() => {
    if (!socket || !selectedChat) return;

    if (!isUserTyping) {
      setIsUserTyping(true);
      socket.emit("typing:start", selectedChat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
      socket.emit("typing:stop", selectedChat._id);
    }, 1000);
  }, [socket, selectedChat, isUserTyping]);
  useEffect(() => {
    let typingTimeout: ReturnType<typeof setTimeout>;
    if (socket && selectedChat && newMessage) {
      socket.emit("typing:start", selectedChat._id);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typing:stop", selectedChat._id);
      }, 1000);
    }
    return () => clearTimeout(typingTimeout);
  }, [newMessage, socket, selectedChat]);

  useEffect(() => {
    console.log(messages);
    if (socket && selectedChat) {
      socket.on("message:receive", (message: Message) => {
        if (message.receiver === currentUserId) {
          onSendMessage(message.content, message.type, message.media);
          getMessages(selectedChat._id);
        }
      });

      return () => {
        socket.off("message:receive");
      };
    }
  }, [socket, selectedChat, onSendMessage, getMessages, currentUserId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size <= 20 * 1024 * 1024) {
      // 20MB
      setFile(file);
      // console.log(file);
      setFileType(file.type.includes("image") ? "image" : "video");
    } else {
      console.error("File size exceeds 20MB");
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      <div className="navbar bg-base-200 px-6 py-3 border-b border-base-300">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="avatar online">
              <div className="w-12 mask mask-squircle">
                <Image
                  src={selectedChat.avatar || "/default-avatar.png"}
                  alt={selectedChat.firstName}
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {selectedChat.firstName} {selectedChat.lastName}
              </h2>
              <p className="text-sm opacity-70">
                {selectedChat.isOnline ? (
                  <span className="badge badge-success badge-sm">Online</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Offline</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-none gap-3">
          <button
            onClick={openCallWindow}
            className="btn btn-ghost btn-circle tooltip tooltip-bottom"
            data-tip="Voice Call"
          >
            <IoCallOutline className="w-5 h-5" />
          </button>
          <button
            onClick={openVideoCallWindow}
            className="btn btn-ghost btn-circle tooltip tooltip-bottom"
            data-tip="Video Call"
          >
            <IoVideocamOutline className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-base-200/20">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={`chat ${
                message.sender._id === currentUserId ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={message.sender.avatar || "/default-avatar.png"}
                    alt={message.sender.username || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div
                className={`chat-bubble ${
                  message.sender._id === currentUserId
                    ? "chat-bubble-primary"
                    : "chat-bubble-neutral"
                }`}
              >
                {message.messageType === "text" ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="w-full">
                    {message.messageType === "image" ? (
                      <div className="w-56 h-56 p-2 relative">
                        <Image
                          src={message.fileUrl}
                          alt="Message"
                          layout="fill"
                          fill
                          sizes="(max-width: 64px) 100vw"
                          objectFit="cover"
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    ) : (
                      <video
                        controls
                        className="w-full max-w-xs rounded-lg shadow-md"
                      >
                        <source src={message.fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-1 text-xs opacity-70">
                  {formatTime(message.createdAt)}
                  <MessageStatus
                    message={message}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Show typing indicator */}
      {isTyping(selectedChat._id) && (
        <div className="p-2 text-sm text-base-content/70">
          {selectedChat.firstName} is typing...
        </div>
      )}

      <div className="p-4 bg-base-200 border-t border-base-300">
        <form onSubmit={handleSubmit} className="join w-full">
          {/* <button
            type="button"
            className="btn btn-ghost join-item"
            title="Add Image"
          >
            <IoImageOutline className="w-5 h-5" />
          </button> */}
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-bordered mr-3 join-item w-full focus:outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            type="file"
            accept=".jpg, .jpeg, .png, .mp4"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          />
          <button
            type="submit"
            className="btn btn-primary join-item"
            disabled={isSubmitting || (!newMessage.trim() && !file)}
          >
            <IoSendSharp className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat_Selected;
