'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { 
  IoPersonAdd, 
  IoSearch, 
  IoClose, 
  IoCheckmarkCircle,
  IoFilter,
  IoMailOutline,
  IoPersonOutline 
} from 'react-icons/io5';
import { useParams } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
}

interface AddContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContactPopup: React.FC<AddContactPopupProps> = ({ isOpen, onClose }) => {
  const params = useParams();
  const userId = params?.userId as string;
  const { user, getAllUsers,getContacts, addContact, contacts, getUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactEmails, setContactEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { users: fetchedUsers } = await getAllUsers(page, 10);
        const currentContactEmails = contacts?.map((contact: { _id : string }) => contact._id) || [];
        setContactEmails(currentContactEmails);
        // console.log(contactEmails)
        // console.log(contacts)
        // console.log(fetchedUsers)
        const filteredUsers = fetchedUsers
          .filter(u => !currentContactEmails.includes(u._id))
          .map(u => ({
            _id: u._id,
            firstName: u.firstName || u.email.split('@')[0],
            lastName: u.lastName || '',
            email: u.email,
            photoURL: u.photoURL || u.avatar
          }));
        // console.log(filteredUsers)
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

  const handleAddContacts = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to add');
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await addContact(userId);
      }
      toast.success(`Added ${selectedUsers.length} contact${selectedUsers.length > 1 ? 's' : ''} successfully`);
      getContacts(user.id);
      getUser(userId)
      onClose();
    } catch (error) {
      toast.error('Failed to add contacts');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.firstName?.toLowerCase() || '').includes(searchLower) ||
      (user.lastName?.toLowerCase() || '').includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-3xl animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-base-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IoPersonAdd className="text-primary w-6 h-6" />
                </div>
                Add New Contacts
              </h2>
              <p className="text-base-content/60 mt-1">
                Find and connect with other users
              </p>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm hover:bg-base-200"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input input-bordered w-full pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost btn-square" title="Filter">
              <IoFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto max-h-[50vh] p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/70">Loading contacts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUserSelection(user._id)}
                  className={`
                    group relative overflow-hidden
                    flex items-center p-3 cursor-pointer
                    transition-all duration-200
                    hover:bg-base-200/70 rounded-xl
                    ${selectedUsers.includes(user._id) ? 'bg-primary/5 ring-1 ring-primary' : ''}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`
                      w-12 h-12 rounded-xl overflow-hidden
                      ${selectedUsers.includes(user._id) ? 'ring-2 ring-primary ring-offset-2' : ''}
                      transition-all duration-200
                    `}>
                      <Image
                        src={user.photoURL || '/default-avatar.png'}
                        alt={`${user.firstName}'s avatar`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-content rounded-full p-0.5">
                        <IoCheckmarkCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium truncate flex items-center gap-2">
                      {user.firstName} {user.lastName}
                      <span className="badge badge-sm badge-ghost">
                        <IoPersonOutline className="w-3 h-3" />
                      </span>
                    </p>
                    <p className="text-sm text-base-content/60 truncate flex items-center gap-1">
                      <IoMailOutline className="w-3 h-3 flex-shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-200 bg-base-200/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedUsers.length > 0 && (
                <div className="badge badge-primary">
                  {selectedUsers.length} selected
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContacts}
                disabled={selectedUsers.length === 0}
                className="btn btn-primary btn-sm"
              >
                {selectedUsers.length === 0 ? (
                  'Select Contacts'
                ) : (
                  <>
                    Add {selectedUsers.length} Contact{selectedUsers.length > 1 ? 's' : ''}
                    <IoPersonAdd className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactPopup;
