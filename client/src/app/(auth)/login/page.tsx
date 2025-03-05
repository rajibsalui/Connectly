'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";
import Register from "@/components/Register";
import Image from "next/image";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { IoArrowBack } from "react-icons/io5";

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-base-200 opacity-50 pattern-grid-lg"></div>
      
      {/* Theme Switcher */}
      {/* <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher isOpen={false} onClose={() => {}} />
      </div> */}

      {/* Back Button */}
      <div
        className="absolute cursor-pointer top-4 bg-red-400 left-4 btn btn-ghost btn-circle"
        onClick={handleClose}  
      >
        <IoArrowBack  onClick={handleClose} className="w-5 cursor-pointer h-5" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold">
                Welcome to{" "}  
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  Connectly
                </span>
              </h1>
              <p className="text-base-content/70 max-w-md leading-relaxed">
                Experience the next generation of communication with AI-powered
                features, secure messaging, and crystal-clear video calls.
              </p>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            {isLoginView ? (
              <Login 
                onRegisterClick={() => setIsLoginView(false)}
                // onClose={handleClose}
              />
            ) : (
              <Register 
                onLoginClick={() => setIsLoginView(true)}
                // onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
