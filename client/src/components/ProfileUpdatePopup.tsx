import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import assets from "../assets/assets";
import toast from 'react-hot-toast';

interface UpdateUserData {
  displayName: string;
  phoneNumber?: string;
  profilePic?: string;
}

interface FormData {
  displayName: string;
  email: string;
  phoneNumber: string;
  profilePic: string | null;
}

const ProfileUpdatePopup = () => {
  const id = useParams();
  const { user, logout, updateProfile, getUser } = useAuth();
  const router = useRouter();
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    phoneNumber: "",
    profilePic: null
  });

  // Update formData when user data is available
  useEffect(() => {
    // console.log(user)
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        profilePic: user.photoURL || null
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilePic: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      toast.error('Name fields are required');
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      toast.error('Invalid phone number format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData: UpdateUserData = {
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber,
        profilePic: formData.profilePic || undefined
      };

      await updateProfile(updateData);
      toast.success('Profile updated successfully');
      setIsOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout =  () => {
    try {
      logout();
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };
  // console.log(id)

  useEffect(() => {
    const chatId = typeof id.chat_id === 'string' ? id.chat_id : '';
    if (chatId) {
      getUser(chatId);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    // console.log(user)

    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, id.chat_id]);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(true)} className="navbar-icon">
        <Image
          src={formData.profilePic || assets.profile_img.src}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div ref={popupRef} className="popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl z-50 w-[30rem]">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
              <label className="relative cursor-pointer">
                <Image
                  src={formData.profilePic || assets.profile_img.src}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Display Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border rounded"
                disabled
              />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={()=>{
                  router.push("/")
                  setIsOpen(false)
                  handleLogout()
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdatePopup;
