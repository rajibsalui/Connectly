import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface User {
  _id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface AddContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContactPopup: React.FC<AddContactPopupProps> = ({ isOpen, onClose }) => {
  const { user, getAllUsers, addContact, getContacts, contacts } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactEmails, setContactEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { users: fetchedUsers } = await getAllUsers(page, 10);
        // Get current contact emails
        const currentContactEmails = contacts.map((contact: { email: string }) => contact.email);
        setContactEmails(currentContactEmails);

        // Filter out current user and contacts
        const filteredUsers = fetchedUsers
          .filter(u => u.email !== user?.email && !currentContactEmails.includes(u.email))
          .map(u => ({
            _id: u._id,
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
          }));

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, page, user, getAllUsers, contacts]);

  const handleAddContact = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to add');
      return;
    }

    try {
      await addContact(selectedUser);
      toast.success('Contact added successfully');
      onClose();
    } catch (error) {
      // console.error('Failed to add contact:', error);
      toast.error('Contact Already Added');
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Contact</h2>
          <input
            type="text"
            placeholder="Search users..."
            className="w-full mt-2 p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                // if(user !== )
                <div
                  key={user._id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedUser === user._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUser(user._id)}
                >
                  <div className="w-10 h-10 relative rounded-full overflow-hidden">
                    <Image
                      src={user.photoURL || '/default-avatar.png'}
                      alt={`${user.displayName}'s avatar`}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddContact}
            disabled={!selectedUser}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedUser
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContactPopup;
