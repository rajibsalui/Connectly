'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePic?: string;
    fullName: string;
  }

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', data.token);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await fetch('http://localhost:5000/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Update failed');
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
      const response = await fetch('http://localhost:5000/users/contacts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ contactId })
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const getContacts = async (userId: string) => {
    // try {
    //   console.log(userId)
    //   const token = localStorage.getItem('token');
    //   if (!token) {
    //     throw new Error('No authentication token found');
    //   }
  
    //   const response = await fetch(`http://localhost:5000/users/${userId}/contacts`, {
    //     method: 'GET',
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json'
    //     },
    //     credentials: 'include'
    //   });
  
    //   if (!response.ok) {
    //     const error = await response.json();
    //     throw new Error(error.message || 'Failed to fetch contacts');
    //   }
  
    //   const data = await response.json();
    //   setContacts(data.contacts || []);
    //   return data.contacts;
    // } catch (error: any) {
    //   console.error('Error fetching contacts:', error);
    //   setContacts([]);
    //   throw new Error(error.message || 'Failed to fetch contacts');
    // }
  };
  
  const getUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;

    } catch (error: any) {
      console.error('Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(error.message || 'Failed to fetch user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, getUser, login, register, logout, isAuthenticated , contacts, updateProfile , addContact, getContacts}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);