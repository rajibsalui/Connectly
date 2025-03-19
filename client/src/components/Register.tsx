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
  IoPersonOutline, 
  IoArrowForward, 
  IoRocket,
  IoClose,
  IoPhonePortraitOutline
} from "react-icons/io5";
import toast from "react-hot-toast";
import VerificationModal from './VerificationModal';

interface RegisterProps {
  onLoginClick: () => void;
  // onClose: () => void;
}

// Add phone to form data interface
interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string; // Add this
}

// Add this before the Register component
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

const Register = ({ onLoginClick }: RegisterProps) => {
  const { register } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
    phone: "", // Add this
  });
  const [showVerification, setShowVerification] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Basic validation
      if (!formData.phone.match(/^\d{10}$/)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const userData = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phone: formData.phone // Add this
      });

      setRegisteredUser(userData);
      setShowVerification(true);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Add validation on phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setFormData({ ...formData, phone: value });
    
    if (value && !isValidPhone(value)) {
      setPhoneError('Please enter a valid 10-digit phone number');
    } else {
      setPhoneError('');
    }
  };

  return (
    <>
      <div className="card w-full h-full max-w-lg bg-base-200/95 backdrop-blur-md shadow-2xl animate-fadeIn">
        <div className="card-body p-6 sm:p-8">
          {/* Close Button */}
          <button 
            // onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm absolute right-2 top-2"
          >
            <IoClose className="w-5 h-5" />
          </button>

          {/* Elegant Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
              <IoRocket className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Create Account
            </h1>
            <p className="text-base-content/60 text-sm sm:text-base">
              Join our community today
            </p>
          </div>

          {/* Social Register */}
          <button
            onClick={async () => {
              try {
                const val = await handleGoogleLogin();
                if (val?.success) {
                  router.push(`/chat/${val.user.id}`);
                  // onClose();
                }
              } catch (error: any) {
                toast.error(error.message || 'Google login failed');
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-300/50">
                    <IoPersonOutline className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input input-bordered bg-base-100/50 w-full focus:outline-none focus:border-primary/50"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-300/50">
                    <IoPersonOutline className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input input-bordered bg-base-100/50 w-full focus:outline-none focus:border-primary/50"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-control">
              <div className="input-group">
                <span className="bg-base-300/50">
                  <IoPersonOutline className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  className="input input-bordered bg-base-100/50 w-full focus:outline-none focus:border-primary/50"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

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

            {/* Enhanced Phone Input */}
            <div className="form-control">
              <div className="input-group">
                <span className={`bg-base-300/50 ${phoneError ? 'text-error' : ''}`}>
                  <IoPhonePortraitOutline className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={`input input-bordered bg-base-100/50 w-full focus:outline-none 
                    ${phoneError ? 'input-error' : 'focus:border-primary/50'}`}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  maxLength={10}
                />
              </div>
              {phoneError && (
                <label className="label">
                  <span className="label-text-alt text-error">{phoneError}</span>
                </label>
              )}
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
                  minLength={6}
                />
              </div>
            </div>

            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-secondary"
                required
              />
              <span className="label-text text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-secondary hover:text-secondary/80">
                  Terms and Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-secondary w-full gap-2 group"
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  Create Account
                  <IoArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-base-content/60 text-sm mt-4">
            Already have an account?{" "}
            <button
              onClick={onLoginClick}
              className="text-secondary hover:text-secondary/80 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        userId={registeredUser?._id}
        email={registeredUser?.email}
        phone={registeredUser?.phone}
        onVerificationComplete={() => {
          toast.success('Account verified successfully!');
          const userId = localStorage.getItem('userId');
          router.push(`/chat/${userId}`);
        }}
      />
    </>
  );
};

export default Register;
