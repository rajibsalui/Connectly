import React from 'react'
import Navigation_Sidebar from './Navigation_Sidebar';

interface Contact {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    online: boolean;
  }

interface CallProps {
    contact: Contact;
}

const Call = () => {
  return (
    <Navigation_Sidebar />
  )
}

export default Call