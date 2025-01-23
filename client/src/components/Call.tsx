import React from 'react'

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
    <div>Call</div>
  )
}

export default Call