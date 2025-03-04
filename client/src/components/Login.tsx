'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { handleGoogleLogin } from "@/app/(auth)/firebaseauthService";
import { 
  IoLogoGoogle, 
  IoMailOutline, 
  IoLockClosed, 
  IoArrowForward,
  IoClose 
} from "react-icons/io5";
import toast from "react-hot-toast";

interface LoginProps {
  onRegisterClick: () => void;
  // onClose: () => void;
}

const Login = ({ onRegisterClick }: LoginProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      const id = localStorage.getItem('userId');
      router.push(`/chat/${id}`);
      // onClose();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-lg bg-base-200/95 backdrop-blur-md shadow-2xl animate-fadeIn">
      <div className="card-body p-6 sm:p-8">
        {/* Close Button */}
        {/* <button 
          // onClick={onClose}
          className="btn btn-ghost btn-circle btn-sm absolute right-2 top-2"
        >
          <IoClose className="w-5 h-5" />
        </button> */}

        {/* Elegant Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <IoMailOutline className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome Back
          </h1>
          <p className="text-base-content/60 text-sm sm:text-base">
            Sign in to continue to your account
          </p>
        </div>

        {/* Social Login */}
        <button
          onClick={async () => {
            const val = await handleGoogleLogin();
            console.log(val.user.id);
            if (val?.success) {
              router.push(`/chat/${val.user.id}`);
              // onClose();
            }
          }}
          className="btn bg-white hover:bg-gray-50 text-gray-800 gap-3 w-full shadow-sm border border-gray-200 hover:border-gray-300"
        >
          <IoLogoGoogle className="w-5 h-5 text-primary" />
          Continue with Google
        </button>

        <div className="divider text-base-content/60 my-4">OR</div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-300/50">
                <IoMailOutline className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered bg-base-100/50 w-full focus:outline-none focus:border-primary/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <div className="input-group">
              <span className="bg-base-300/50">
                <IoLockClosed className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered bg-base-100/50 w-full focus:outline-none focus:border-primary/50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              />
              <span className="label-text">Remember me</span>
            </label>
            <Link 
              href="/forgot-password" 
              className="text-primary hover:text-primary/80"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full gap-2 group"
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                Sign In
                <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-base-content/60 text-sm mt-4">
          Don't have an account?{" "}
          <button
            onClick={onRegisterClick}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
