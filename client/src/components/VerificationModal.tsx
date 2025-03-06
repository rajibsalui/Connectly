import React, { useState, useEffect } from 'react';
import { config } from "../config/config";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  IoMailOutline, 
  IoPhonePortraitOutline, 
  IoCheckmarkCircle,
  IoReloadOutline,
  IoCloseOutline 
} from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  phone: string;
  onVerificationComplete: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  userId,
  email,
  phone,
  onVerificationComplete
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [useremail, setEmail] = useState('');
  const [userphone, setPhone] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isFullyVerified, setIsFullyVerified] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setEmail(user.email);
        setPhone(user.phoneNumber);
      sendVerificationCodes();
    }
    return () => {
      setEmailCode('');
      setPhoneCode('');
      setEmailVerified(false);
      setPhoneVerified(false);
    };
  }, [isOpen]);

  useEffect(() => {
    // console.log(email,phone)

    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (emailVerified && phoneVerified) {
      setIsFullyVerified(true);
    }
  }, [emailVerified, phoneVerified]);

  const sendVerificationCodes = async () => {
    // console.log(email,phone)
    // console.log(user)
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${config.serverUrl}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email, phone })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification codes');
      }
      
      toast.success('Verification codes sent successfully');
      setResendTimer(60); // Start 60 second countdown
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (type: 'email' | 'phone') => {
    setIsLoading(true);
    try {
      const code = type === 'email' ? emailCode : phoneCode;
      console.log(type, code)
      const response = await fetch(`${config.serverUrl}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Invalid ${type} verification code`);
      }

      if (type === 'email') {
        setEmailVerified(true);
        toast.success('Email verified successfully');
      } else {
        setPhoneVerified(true);
        toast.success('Phone verified successfully');
      }

      // Check if both are now verified
      if ((type === 'email' && phoneVerified) || (type === 'phone' && emailVerified)) {
        setIsFullyVerified(true);
        toast.success('Both email and phone verified successfully');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!isFullyVerified) {
      toast.error('Please verify both email and phone before continuing');
      return;
    }
    onVerificationComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Account</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        {/* Email Verification */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <IoMailOutline className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Email Verification</h3>
          </div>
          <p className="text-sm text-base-content/70 mb-3">
            Enter the code sent to {email}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className={`input input-bordered flex-1 font-mono text-center tracking-wider
                ${emailVerified ? 'input-success' : ''}`}
              disabled={emailVerified}
              maxLength={6}
            />
            <button
              onClick={() => verifyCode('email')}
              className={`btn ${emailVerified ? 'btn-success' : 'btn-primary'}`}
              disabled={emailVerified || !emailCode || emailCode.length !== 6 || isLoading}
            >
              {emailVerified ? <IoCheckmarkCircle className="w-5 h-5" /> : 'Verify'}
            </button>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <IoPhonePortraitOutline className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Phone Verification</h3>
          </div>
          <p className="text-sm text-base-content/70 mb-3">
            Enter the code sent to {phone}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className={`input input-bordered flex-1 font-mono text-center tracking-wider
                ${phoneVerified ? 'input-success' : ''}`}
              disabled={phoneVerified}
              maxLength={6}
            />
            <button
              onClick={() => verifyCode('phone')}
              className={`btn ${phoneVerified ? 'btn-success' : 'btn-primary'}`}
              disabled={phoneVerified || !phoneCode || phoneCode.length !== 6 || isLoading}
            >
              {phoneVerified ? <IoCheckmarkCircle className="w-5 h-5" /> : 'Verify'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <button
            onClick={sendVerificationCodes}
            className="btn btn-outline gap-2"
            disabled={isLoading || resendTimer > 0}
          >
            <IoReloadOutline className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Codes'}
          </button>
          <button
            onClick={handleContinue}
            className={`btn ${isFullyVerified ? 'btn-success' : 'btn-primary'}`}
            disabled={!isFullyVerified || isLoading}
          >
            {isFullyVerified ? 'Continue' : 'Verify Both'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;