"use client";
import React, { useState } from "react";
import Modal from "../ui/Modal";
import Login from "../Login";
import Register from "../Register";
import { IoMailOutline, IoRocket } from "react-icons/io5";

interface AuthModalsProps {
  initialView?: "login" | "register";
}

const AuthModals = ({ initialView = "login" }: AuthModalsProps) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <>
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <Login
          onRegisterClick={openRegister}
          onClose={() => setIsLoginOpen(false)}
        />
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
        <Register
          onLoginClick={openLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      </Modal>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={openLogin}
          className="btn btn-primary flex-1 gap-2 group transition-all duration-300"
        >
          <IoMailOutline className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Get Started
        </button>
        <button
          onClick={openRegister}
          className="btn btn-secondary flex-1 group transition-all duration-300"
        >
          <IoRocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Register Free
        </button>
      </div>
    </>
  );
};

export default AuthModals;
