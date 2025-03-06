"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileUpdatePopup from "@/components/ProfileUpdatePopup";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  IoMailOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoPencil,
  IoArrowBack,
  IoImageOutline,
  IoCalendarOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";

const ProfilePage = () => {
  const { user, getUser } = useAuth();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      getUser(storedUserId);
    }
    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [router]);

  const handleBack = () => {
    const localuserId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/chat/${userId}`);
    } else {
      router.push(`/chat/${localuserId}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 p-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="btn btn-ghost btn-circle absolute top-6 left-6 hover:bg-base-200/50"
      >
        <IoArrowBack className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto pt-10">
        {/* Profile Card */}
        <div className="card bg-base-100 shadow-2xl">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-2xl relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative w-32 h-32">
                <Image
                  src={user?.avatar || "/default-avatar.png"}
                  alt="Profile"
                  fill
                  sizes="(max-width: 128px) 100vw"
                  className="rounded-2xl object-cover shadow-lg ring-4 ring-base-100"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="card-body pt-20 px-8">
            {/* Profile Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-base-content">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-base-content/60 text-lg">@{user?.username}</p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="btn btn-primary btn-outline gap-2"
              >
                <IoPencil className="w-5 h-5" />
                Edit Profile
              </button>
            </div>

            {/* Profile Info */}
            <div className="divider my-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IoMailOutline className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-base-content/60">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{user?.email}</p>
                      {user?.emailVerified ? (
                        <span className="flex items-center text-success text-sm">
                          <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-error text-sm">
                          <IoCloseCircle className="w-4 h-4 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IoPhonePortraitOutline className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-base-content/60">Phone Number</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{user?.phoneNumber || 'Not added'}</p>
                      {user?.phoneVerified ? (
                        <span className="flex items-center text-success text-sm">
                          <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-error text-sm">
                          <IoCloseCircle className="w-4 h-4 mr-1" />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IoCalendarOutline className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Member Since</p>
                    <p className="font-medium">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                
                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Verification Status</div>
                    <div className="stat-value text-lg">
                      {user?.emailVerified && user?.phoneVerified ? (
                        <span className="text-success">Complete</span>
                      ) : (
                        <span className="text-warning">Incomplete</span>
                      )}
                    </div>
                  </div>
                  <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Account Type</div>
                    <div className="stat-value text-lg">
                      {user?.isAdmin ? 'Admin' : 'User'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <button
                  className="btn btn-outline w-full justify-start gap-3 hover:bg-primary hover:text-primary-content"
                  onClick={() => setShowProfileModal(true)}
                >
                  <IoSettingsOutline className="w-5 h-5" />
                  Update Profile Settings
                </button>

                {(!user?.emailVerified || !user?.phoneVerified) && (
                  <button
                    className="btn btn-warning w-full justify-start gap-3"
                    onClick={() => setShowProfileModal(true)}
                  >
                    <IoCheckmarkCircle className="w-5 h-5" />
                    Complete Verification
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Update Modal */}
      <ProfileUpdatePopup
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
