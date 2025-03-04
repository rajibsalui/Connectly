"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

// Set up the socket URL from environment variables
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Define the types for the context
interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  typingUsers: Map<string, boolean>;
  isOnline: (userId: string) => boolean;
  isTyping: (userId: string) => boolean;
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
}

// Create the context
const SocketContext = createContext<SocketContextType | null>(null);

// Define props for the provider component
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    // console.log(user)
    if (isAuthenticated && user) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
        withCredentials: true,
      });

      newSocket.on("connect", () => console.log("Socket connected"));

      newSocket.on("user:online", (userId: string) => {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      });

      newSocket.on("user:offline", (userId: string) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      });

      newSocket.on("typing:start", (userId: string) => {
        setTypingUsers((prev) => new Map(prev).set(userId, true));
      });

      newSocket.on("typing:stop", (userId: string) => {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const connectSocket = (token: string) => {
    if (!socket) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token,
        },
        withCredentials: true,
      });

      setSocket(newSocket);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const value: SocketContextType = {
    socket,
    onlineUsers,
    typingUsers,
    isOnline: (userId) => onlineUsers.has(userId),
    isTyping: (userId) => typingUsers.has(userId),
    connectSocket,
    disconnectSocket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook for using the socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
