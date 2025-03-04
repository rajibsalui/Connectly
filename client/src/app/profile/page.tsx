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
} from "react-icons/io5";

const ProfilePage = () => {
  const { user, getUser } = useAuth();
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [router]);

  const handleBack = () => {
    if (userId) {
      router.push(`/chat/${userId}`);
    } else {
      router.push('/chat');
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
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IoMailOutline className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
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

              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <button
                  className="btn btn-outline w-full justify-start gap-3 hover:bg-primary hover:text-primary-content"
                  onClick={() => setShowProfileModal(true)}
                >
                  <IoSettingsOutline className="w-5 h-5" />
                  Update Profile Settings
                </button>
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
