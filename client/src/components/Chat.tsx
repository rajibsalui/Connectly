"use client";
import React, { useEffect, useState, useRef } from "react";
import assets from "../assets/assets";
import Chat_Navigation_Sidebar from "./Navigation_Sidebar";
import Chat_Contacts from "./Chat_Contact";
import Chat_Selected from "./Chat_Selected";
import Chat_Search from "./Chat_Search";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { config } from "../config/config";
import { IoAddOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useSocket } from "@/context/SocketContext";
import AddContactPopup from "./Add_Contact";

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
}

const Chat = () => {
  const { user, getContacts, contacts } = useAuth();
  const { messages, getMessages, sendMessage, markMessageAsDelivered } =
    useChat();
  const [selectedChat, setSelectedChat] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { socket, connectSocket, disconnectSocket, isOnline, isTyping } =
    useSocket();

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [router]);

  // Handle socket events
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("setup", user._id);

      socket.on(
        "message received",
        async (data: { chatId: string; message: Message }) => {
          if (data.chatId === chatId) {
            // Mark message as delivered
            getMessages(chatId);
            await markMessageAsDelivered(data.message._id);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      );

      return () => {
        socket.off("message received");
      };
    }
  }, [socket, user, chatId, getMessages, markMessageAsDelivered]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          await getContacts(user.id);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchContacts();
    }
  }, [user, isAddContactOpen, setIsAddContactOpen]);

  const handleChatSelect = async (contact: Contact) => {
    try {
      if (selectedChat?._id === contact._id) {
        setSelectedChat(null);
        setChatId(null);
        return;
      }
      setSelectedChat(contact);
      setIsLoading(true);

      // const data = await response.json();
      setChatId(contact._id);

      if (socket) {
        socket.emit("join chat", contact._id);
      }

      // console.log(contact._id)
      // Fetch messages using ChatContext
      if (contact._id) {
        await getMessages(contact._id);
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!chatId || !user?._id || !selectedChat) return;

    try {
      const messageContent = {
        chatId,
        content,
        sender: user._id,
        receiver: selectedChat._id,
      };

      const message = await sendMessage(messageContent);

      if (socket) {
        socket.emit("new message", {
          chatId,
          messageId: message._id,
          content: message.content,
          sender: user._id,
          receiver: selectedChat._id,
        });
      }

      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const chatAssets = {
    chat_bg: assets.chat_bg.src,
    gallery_icon: assets.gallery_icon.src,
    send_button: assets.send_button.src,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-base-100">
      <Chat_Navigation_Sidebar />

      {/* Main Content - adjusted for fixed sidebar */}
      <div className="flex-1 ml-20 flex">
        {/* Contacts Section */}
        <div className="w-80 border-r border-base-300 bg-base-200/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Chat_Search
              isAddContactOpen={isAddContactOpen}
              setIsAddContactOpen={setIsAddContactOpen}
            />
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="btn btn-primary btn-circle hover:btn-primary-focus transition-all duration-200"
              title="Add New Contact"
            >
              <IoAddOutline className="w-6 h-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-80px)] -z-10 scrollbar-thin scrollbar-thumb-base-300">
            {isLoading ? (
              <div className="flex z-30 justify-center items-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <div className="loading-dots">
                    <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
                  </div>
                  <p className="text-sm text-base-content/70 animate-pulse">
                    Loading contacts...
                  </p>
                </div>
              </div>
            ) : (
              contacts.map((contact: Contact) => (
                <Chat_Contacts
                  key={contact._id}
                  contact={contact}
                  selectedChat={selectedChat}
                  isAddContactOpen={isAddContactOpen} // Pass the state
                  setSelectedChat={handleChatSelect}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-base-100">
        <AddContactPopup
            isOpen={isAddContactOpen}
            onClose={() => setIsAddContactOpen(false)}
          />
          {selectedChat ? (
            <Chat_Selected
              selectedChat={selectedChat}
              messages={messages}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              assets={chatAssets}
              currentUserId={user?.id}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-200/30 to-base-300/30 backdrop-blur-sm">
              <div className="card w-[480px] bg-base-100 shadow-2xl text-center border border-base-300">
                <div className="card-body items-center p-12">
                  <div className="avatar bg-gradient-to-br from-primary/20 to-secondary/20 p-6 rounded-full mb-4">
                    <div className="bg-gradient-to-br from-primary to-secondary relative flex justify-center items-center text-base-100 rounded-full w-24 h-24">
                      <IoChatbubbleEllipsesOutline className="w-14 h-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h2 className="card-title text-3xl font-bold text-base-content mb-4">
                    Welcome to Connectly
                  </h2>
                  <p className="text-base-content/70 text-lg max-w-sm mb-8">
                    Connect and chat with your contacts in real-time. Select a
                    conversation from the left to get started.
                  </p>
                  <div className="card-actions flex gap-4">
                    <div className="badge badge-lg badge-outline gap-2">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                      Secure
                    </div>
                    <div className="badge badge-lg badge-primary gap-2">
                      <span className="w-2 h-2 bg-base-100 rounded-full"></span>
                      Real-time
                    </div>
                    <div className="badge badge-lg badge-secondary gap-2">
                      <span className="w-2 h-2 bg-base-100 rounded-full"></span>
                      End-to-End
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
