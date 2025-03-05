"use client";
import { useParams } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "../config/config";

interface AuthContextType {
  user: any;
  getUser: (userId: string) => Promise<void>;
  contacts: any;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  addContact: (contactId: string) => Promise<void>;
  getContacts: (userId: string) => Promise<void>;
  isAuthenticated: boolean;
  getAllUsers: (
    page?: number,
    limit?: number
  ) => Promise<{
    users: User[];
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  }>;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  profilePic?: string;
  fullName: string;
}

interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
}

interface Chat {
  _id: string;
  participants: User[];
  messages: Message[];
  lastMessage: {
    content: string;
    sender: string;
    timestamp: Date;
  };
}

interface SaveMessageParams {
  chatId: string;
  content: string;
  sender: string;
  receiver: string;
}

interface UserSettings {
  theme?: string;
  notifications?: {
    messages: boolean;
    sounds: boolean;
    email: boolean;
  };
  privacy?: {
    onlineStatus: boolean;
    readReceipts: boolean;
    typingIndicators: boolean;
  };
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${config.serverUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch(`${config.serverUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("token", data.token);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${config.serverUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } catch (error) {
      throw error;
    }
  };
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await fetch(`${config.serverUrl}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const data = await response.json();
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const addContact = async (contactId: string) => {
    try {
      const response = await fetch(`${config.serverUrl}/users/contacts/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ contactId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const id = useParams();
  const chatId = typeof id.chat_id === "string" ? id.chat_id : "";

  const getContacts = async (userId: string) => {
    try {
      // console.log(userId)
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${config.serverUrl}/users/contacts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        // throw new Error(error.message || 'Failed to fetch contacts');
      }

      const data = await response.json();
      // console.log(data.contacts)
      setContacts(data.contacts || []);
      return data;
    } catch (error: any) {
      console.error("Error fetching contacts:", error);
      setContacts([]);
      throw new Error(error.message || "Failed to fetch contacts");
    }
  };

  const getUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${config.serverUrl}/auth/check`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user");
      }

      const userData = await response.json();
      localStorage.setItem("userId", userData.user.id);
      setUser(userData.user);
      setIsAuthenticated(true);
      return userData;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsAuthenticated(false);
      // throw new Error(error.message || 'Failed to fetch user');
    }
  };

  const getAllUsers = async (page: number = 1, limit: number = 10) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${config.serverUrl}/users/all?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }

      const data = await response.json();
      // console.log(data.users);
      return {
        users: data.users,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalUsers: data.totalUsers,
      };
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw new Error(error.message || "Failed to fetch users");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        getUser,
        login,
        register,
        logout,
        isAuthenticated,
        contacts,
        updateProfile,
        addContact,
        getContacts,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
