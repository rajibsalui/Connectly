import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { IoPersonAdd, IoSearch, IoClose, IoCheckmarkCircle } from 'react-icons/io5';
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
    <div className="relative inset-0 bg-base-200/95 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-base-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <IoPersonAdd className="text-primary w-7 h-7" />
                Add New Contacts
              </h2>
              <p className="text-base-content/60 mt-1">Connect with other users on the platform</p>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-circle hover:bg-base-200/70"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-bordered w-full pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`
                    flex items-center px-4 py-2 cursor-pointer
                    transition-all duration-200 ease-in-out
                    hover:bg-base-200/70 rounded-xl
                    ${selectedUsers.includes(user._id) ? 'bg-primary/10' : ''}
                  `}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="relative">
                    <div className={`
                      rounded-xl overflow-hidden w-14 h-14
                      ${selectedUsers.includes(user._id) ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}>
                      <Image
                        src={user.photoURL || '/default-avatar.png'}
                        alt={`${user.firstName}'s avatar`}
                        width={56}
                        height={56}
                        className="rounded-xl object-cover w-full h-full"
                      />
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                        <IoCheckmarkCircle className="w-5 h-5 text-primary-content" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-base-content/60 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-200 bg-base-200/30 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {/* <div className="flex items-center gap-2">
              {selectedUsers.length > 0 && (
                <div className="badge badge-primary badge-outline tracking-tighter leading-none">
                  <p>{selectedUsers.length} selected</p>
                </div>
              )}
              <p className="text-base-content/70 text-sm">
                {selectedUsers.length > 0 ? 'Ready to add contacts' : 'Select users to add as contacts'}
              </p>
            </div> */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-ghost hover:bg-base-200/70"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContacts}
                disabled={selectedUsers.length === 0}
                className="btn btn-primary min-w-[120px] disabled:opacity-50"
              >
                {selectedUsers.length > 0 ? `Add ${selectedUsers.length} Contact${selectedUsers.length > 1 ? 's' : ''}` : 'Select Users'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactPopup;
