"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  IoCamera,
  IoMailOutline,
  IoPersonOutline,
  IoAtCircleOutline,
  IoKeyOutline,
  IoLogOutOutline,
  IoCloseOutline,
  IoChevronForward,
  IoPhonePortraitOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import VerificationModal from './VerificationModal';

interface ProfileUpdatePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileUpdatePopup: React.FC<ProfileUpdatePopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, getUser, logout, updateProfile } = useAuth();
  const params = useParams();
  const userId = params?.userId as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone:"",
    currentPassword: "",
    newPassword: "",
    avatar: null as string | null,
  });
  const [showVerification, setShowVerification] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        await getUser(userId);
      }
    };

    fetchUser();
  }, [userId, getUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phoneNumber||"",
        currentPassword: "",
        newPassword: "",
        avatar: user.avatar || null,
      });
    }
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        avatar: formData.avatar,
        ...(showPasswordFields && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      toast.success("Profile updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setNewPhoneNumber(value);
    
    if (value && !validatePhone(value)) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleVerificationComplete = async () => {
    try {
      await updateProfile({
        ...formData,
        phoneNumber: newPhoneNumber
      });
      toast.success("Phone number updated successfully");
      setShowVerification(false);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update phone number");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="container mx-auto px-4 mt-40 min-h-screen flex items-center justify-center">
          <div className="card bg-base-100 shadow-2xl w-full max-w-4xl animate-fadeIn">
            <div className="card-body p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="btn btn-ghost btn-circle btn-sm absolute right-4 top-4"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary">Profile Settings</h2>
                <p className="text-base-content/60 mt-2">
                  Manage your personal information and account settings
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Avatar */}
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                      <div className="w-48 h-48 overflow-hidden rounded-full relative">
                        <Image
                          src={formData.avatar || "/default-avatar.png"}
                          alt="Profile"
                          fill
                          sizes="(max-width: 192px) 100vw"
                          className="object-cover ring-4 ring-primary ring-offset-base-100 ring-offset-2"
                        />
                      </div>

                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                        <IoCamera className="w-8 h-8 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-base-content/70">
                      Click to upload new profile picture
                    </p>
                  </div>

                  {/* Right Column - Form Fields */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">First Name</span>
                        </label>
                        <div className="input-group">
                          <span className="bg-base-200">
                            <IoPersonOutline className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            placeholder="First Name"
                            className="input input-bordered w-full"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Last Name</span>
                        </label>
                        <div className="input-group">
                          <span className="bg-base-200">
                            <IoPersonOutline className="w-5 h-5" />
                          </span>
                          <input
                            type="text"
                            placeholder="Last Name"
                            className="input input-bordered w-full"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Username</span>
                      </label>
                      <div className="input-group">
                        <span className="bg-base-200">
                          <IoAtCircleOutline className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Username"
                          className="input input-bordered w-full"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <div className="input-group">
                        <span className="bg-base-200">
                          <IoMailOutline className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          placeholder="Email"
                          className="input input-bordered w-full"
                          value={formData.email}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone Number</span>
                      </label>
                      <div className="input-group">
                        <span className="bg-base-200">
                          <IoPhonePortraitOutline className="w-5 h-5" />
                        </span>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          className={`input input-bordered w-full ${phoneError ? 'input-error' : ''}`}
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          maxLength={10}
                        />
                      </div>
                      {phoneError && (
                        <label className="label">
                          <span className="label-text-alt text-error">{phoneError}</span>
                        </label>
                      )}
                      {newPhoneNumber && !phoneError && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm mt-2"
                          onClick={() => setShowVerification(true)}
                        >
                          Verify Phone Number
                        </button>
                      )}
                    </div>

                    <div className="collapse collapse-plus bg-base-200 rounded-box">
                      <input
                        type="checkbox"
                        checked={showPasswordFields}
                        onChange={() => setShowPasswordFields(!showPasswordFields)}
                      />
                      <div className="collapse-title text-base font-medium flex items-center gap-2">
                        <IoKeyOutline className="w-5 h-5" />
                        Change Password
                      </div>
                      <div className="collapse-content space-y-4 pt-4">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="input input-bordered w-full"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="input input-bordered w-full"
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-base-300">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-error btn-outline gap-2"
                  >
                    <IoLogOutOutline className="w-5 h-5" />
                    Logout
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary gap-2"
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        Save Changes
                        <IoChevronForward className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        phone={newPhoneNumber}
        email={formData.email}
        userId={userId}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
};

export default ProfileUpdatePopup;
