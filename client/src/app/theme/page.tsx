"use client";
import React, { useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

const ThemePage = () => {
  const router = useRouter();
  const [showThemeMenu, setShowThemeMenu] = useState(true);


  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <button
        onClick={handleBack}
        className="btn btn-ghost btn-circle absolute top-4 left-4 hover:bg-base-200/50"
      >
        <IoArrowBack className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Choose Your Theme</h1>
        <ThemeSwitcher  isOpen={showThemeMenu}
          onClose={() => setShowThemeMenu(false)}/>
      </div>
    </div>
  );
};

export default ThemePage;
