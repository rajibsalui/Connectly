"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-hot-toast";
import {
  IoHappy,
  IoHeart,
  IoThumbsUp,
  IoSad,
  IoFlameOutline,
  IoCallOutline,
  IoVideocamOutline,
  IoEllipsisVertical,
  IoTrashOutline,
  IoInformationCircleOutline,
  IoSendSharp,
  IoImageOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoWarningOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import MediaPreview from "./MediaPreview";

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
  reactions?: { type: string; users: string[] }[];
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

const MessageStatus: React.FC<{ message: any; currentUserId: string }> = ({
  message,
  currentUserId,
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

const REACTIONS = [
  { type: "👍", label: "Like", color: "text-blue-500" },
  { type: "❤️", label: "Love", color: "text-red-500" },
  { type: "😄", label: "Haha", color: "text-yellow-500" },
  { type: "😮", label: "Wow", color: "text-orange-500" },
  { type: "😢", label: "Sad", color: "text-indigo-500" },
  { type: "👎", label: "Dislike", color: "text-gray-500" },
];

const MessageReactions: React.FC<{
  message: Message;
  currentUserId: string;
}> = ({ message, currentUserId }) => {
  const { addReaction, removeReaction } = useChat();
  const { socket } = useSocket();
  useEffect(() => {
    socket?.on(
      "reaction:add",
      (data: {
        messageId: string;
        reactionType: string;
        userId: string;
        receiverId: string;
      }) => {
        if (
          data.messageId === message._id &&
          data.receiverId === currentUserId
        ) {
          message.reactions?.push({
            type: data.reactionType,
            users: [data.userId],
          });
        }
      }
    );
    return () => {
      socket?.off("reaction:add");
    };
  });

  const handleReaction = async (type: string) => {
    try {
      const hasReacted = message.reactions?.some(
        (r) =>
          r.type === type &&
          Array.isArray(r.users) &&
          r.users.includes(currentUserId)
      );

      if (hasReacted) {
        await removeReaction(message._id, type);
        // Emit reaction removal
        socket?.emit("reaction:remove", {
          messageId: message._id,
          reactionType: type,
          userId: currentUserId,
          receiverId:
            message.sender._id === currentUserId
              ? message.receiver
              : message.sender._id,
        });
      } else {
        await addReaction(message._id, type);
        // Emit new reaction
        socket?.emit("reaction:add", {
          messageId: message._id,
          reactionType: type,
          userId: currentUserId,
          receiverId:
            message.sender._id === currentUserId
              ? message.receiver
              : message.sender._id,
        });
      }
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  const getReactionCount = (type: string) => {
    return message.reactions?.find((r) => r.type === type)?.users?.length || 0;
  };

  const hasUserReacted = (type: string) => {
    return (
      message.reactions?.some(
        (r) => r.type === type && r.users?.includes(currentUserId)
      ) || false
    );
  };

  return (
    <div className="group">
      {/* Reaction Picker - Shows on message hover */}
      <div
        className={`absolute -top-10 ${
          currentUserId === message.receiver._id ? "left-32" : "-left-10"
        }  transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10`}
      >
        <div className="flex items-center gap-1 bg-base-100 rounded-full shadow-lg p-2 border border-base-200">
          {REACTIONS.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`
                p-1 rounded-full hover:bg-base-200 transition-all duration-200
                ${
                  hasUserReacted(type)
                    ? `${color} scale-125`
                    : "opacity-70 hover:opacity-100"
                }
              `}
              title={label}
            >
              <span className="text-lg">{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Existing Reactions - Shows at bottom of message */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          key={message._id}
          className="absolute opacity-100 -bottom-8 -left-4 flex flex-wrap gap-1"
        >
          {message.reactions
            // .filter(reaction => getReactionCount(reaction.type) > 0)
            .map((reaction) => {
              const reactionConfig = REACTIONS.find(
                (r) => r.type === reaction.type
              );
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full
                    bg-base-100/95 backdrop-blur-sm border shadow-sm
                    hover:scale-105 transition-transform duration-200
                    ${
                      hasUserReacted(reaction.type)
                        ? `${reactionConfig?.color} border-primary/20`
                        : "text-gray-500 border-base-200"
                    }
                  `}
                  title={`${getReactionCount(reaction.type)} ${
                    getReactionCount(reaction.type) === 1 ? "person" : "people"
                  }`}
                >
                  <span className="text-base">{reaction.reaction}</span>
                  {/* <span className="text-xs font-medium">{getReactionCount(reaction.type)}</span> */}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

const Chat_Selected: React.FC<ChatSelectedProps> = ({
  selectedChat,
  messages,
  onSendMessage,
  messagesEndRef,
  assets,
  currentUserId,
}) => {
  const router = useRouter();
  const { socket, isTyping } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileType, setFileType] = useState("text");
  const {
    sendMessage,
    markMessageAsDelivered,
    updateMessage,
    getMessages,
    deleteMessage,
    deleteChat,
  } = useChat();
  const { user } = useAuth();
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

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
        savedMessage.messageType,
        savedMessage.file
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

  useEffect(() => {
    if (socket && selectedChat) {
      // Listen for new reactions
      socket.on("reaction:received", ({ messageId, reactionType, userId }) => {
        getMessages(selectedChat._id); // Refresh messages to get updated reactions
      });

      // Listen for reaction removals
      socket.on("reaction:removed", ({ messageId, reactionType, userId }) => {
        getMessages(selectedChat._id); // Refresh messages to get updated reactions
      });

      return () => {
        socket.off("reaction:received");
        socket.off("reaction:removed");
      };
    }
  }, [socket, selectedChat, getMessages]);

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

  const handleDeleteChat = async () => {
    // console.log(selectedChat._id);

    try {
      // console.log(selectedChat._id);
      await deleteChat(selectedChat._id);
      toast.success("Chat deleted successfully");
      // Add navigation logic here if needed
      setShowDeleteConfirm(false);
      // router.push("/chat"); // Redirect to chat list
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
      getMessages(selectedChat._id);
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleUpdateMessage = async (messageId: string) => {
    try {
      await updateMessage(messageId, editContent);
      setEditingMessage(null);
      setEditContent("");
      getMessages(selectedChat._id);
      toast.success("Message updated");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  const MessageActions = ({ message }: { message: Message }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="dropdown dropdown-end">
        <button
          className="btn btn-ghost btn-xs btn-circle"
          onClick={() => setShowActions(!showActions)}
        >
          <IoEllipsisVertical className="w-4 h-4" />
        </button>
        {showActions && (
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
            {message.sender._id === currentUserId && (
              <>
                <li>
                  <button
                    onClick={() => {
                      setEditingMessage(message._id);
                      setEditContent(message.content);
                      setShowActions(false);
                    }}
                  >
                    <IoPencilOutline className="w-4 h-4" />
                    Edit Message
                  </button>
                </li>
                <li>
                  <button
                    className="text-error"
                    onClick={() => handleDeleteMessage(message._id)}
                  >
                    <IoTrashOutline className="w-4 h-4" />
                    Delete Message
                  </button>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-100 px-6 py-2 border-b border-base-200 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full ring-2 ring-primary/20 overflow-hidden">
                <Image
                  src={selectedChat.avatar || "/default-avatar.png"}
                  alt={selectedChat.firstName}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              {selectedChat.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full bg-success" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {selectedChat.firstName} {selectedChat.lastName}
              </h2>
              <p className="text-sm text-base-content/60">
                {isTyping(selectedChat._id) ? (
                  <span className="text-primary flex items-center gap-1">
                    <span className="loading loading-dots loading-xs"></span>
                    typing...
                  </span>
                ) : selectedChat.isOnline ? (
                  "Active now"
                ) : (
                  "Offline"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={openCallWindow}
              className="btn btn-ghost btn-sm tooltip tooltip-bottom"
              data-tip="Voice Call"
            >
              <IoCallOutline className="w-5 h-5" />
            </button>
            <button
              onClick={openVideoCallWindow}
              className="btn btn-ghost btn-sm tooltip tooltip-bottom"
              data-tip="Video Call"
            >
              <IoVideocamOutline className="w-5 h-5" />
            </button>
          </div>
          <div className="dropdown dropdown-end">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <IoEllipsisVertical className="w-5 h-5" />
            </button>
            <ul className="dropdown-content menu menu-sm p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2">
              <li>
                <button className="text-base-content/70">
                  <IoInformationCircleOutline className="w-4 h-4" />
                  View Profile
                </button>
              </li>
              <li>
                <button
                  className="text-error"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <IoTrashOutline className="w-4 h-4" />
                  Delete Chat
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: 'url("/chat-pattern.png")',
          backgroundOpacity: "0.05",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`flex ${
              message.sender._id === currentUserId
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`
              max-w-[75%] group relative
              ${
                message.sender._id === currentUserId
                  ? "flex-row-reverse"
                  : "flex-row"
              }
              ${message.reactions?.length > 0 ? "mb-6" : ""}
            `}
            >
              <div
                className={`
                relative px-4 py-2 rounded-2xl shadow-sm
                ${
                  message.sender._id === currentUserId
                    ? "bg-primary text-primary-content"
                    : "bg-base-200"
                }
                ${message.messageType !== "text" ? "p-1" : ""}
                hover:shadow-md transition-shadow
              `}
              >
                {/* Message Content */}
                {editingMessage === message._id ? (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input input-sm input-bordered flex-1"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateMessage(message._id)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <IoCheckmarkOutline className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="btn btn-ghost btn-xs btn-circle"
                      >
                        <IoCloseOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.messageType === "text" ? (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    ) : (
                      // ... existing media render code ...
                      <div className="w-full">
                        {message.messageType === "image" ? (
                          <div
                            className="w-56 h-56 p-2 relative"
                            onClick={() => {
                              setIsOpen(true);
                            }}
                          >
                            <Image
                              src={message.fileUrl}
                              alt="Message"
                              layout="fill"
                              fill
                              sizes="(max-width: 64px) 100vw"
                              objectFit="cover"
                              className="rounded-lg shadow-md"
                            />
                            <MediaPreview
                              isOpen={isOpen}
                              onClose={() => setIsOpen(false)}
                              mediaUrl={message.fileUrl}
                              mediaType="image" // or "video"
                              caption="Optional caption text"
                            />
                          </div>
                        ) : (
                          <div 
                          // onClick={() => {
                          //   setIsOpen(true);
                          // }}
                          >
                            <video
                              controls
                              className="w-full max-w-xs rounded-lg shadow-md"
                            >
                              <source src={message.fileUrl} type="video/mp4" />
                              {/* <MediaPreview
                              isOpen={isOpen}
                              onClose={() => setIsOpen(false)}
                              mediaUrl={message.fileUrl}
                              mediaType="image" // or "video"
                              caption="Optional caption text"
                            /> */}
                              Your browser does not support the video tag.
                            </video>
                            {/* <MediaPreview
                              isOpen={isOpen}
                              onClose={() => setIsOpen(false)}
                              mediaUrl={message.fileUrl}
                              mediaType="image" // or "video"
                              caption="Optional caption text"
                            /> */}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Message Footer */}
                <div
                  className={`
                  flex items-center gap-1 mt-1 text-xs
                  ${
                    message.sender._id === currentUserId
                      ? "text-primary-content/70"
                      : "text-base-content/60"
                  }
                `}
                >
                  {formatTime(message.createdAt)}
                  <MessageStatus
                    message={message}
                    currentUserId={currentUserId}
                  />
                </div>

                {/* Reactions */}
                <MessageReactions
                  message={message}
                  currentUserId={currentUserId}
                />
              </div>

              {/* Message Actions */}
              {message.sender._id === currentUserId && (
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageActions message={message} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-base-100 border-t border-base-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="file"
            id="file-input"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-input" className="btn btn-ghost btn-circle">
            <IoImageOutline className="w-5 h-5" />
          </label>
          <input
            type="text"
            placeholder="Type a message..."
            className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={() => handleTyping()}
          />
          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={isSubmitting || (!newMessage.trim() && !file)}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <IoSendSharp className="w-5 h-5" />
            )}
          </button>
        </form>
        {file && (
          <div className="mt-2 p-2 bg-base-200 rounded-lg flex items-center gap-2">
            <div className="flex-1 truncate">{file.name}</div>
            <button
              onClick={() => setFile(null)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <IoCloseOutline className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat_Selected;
