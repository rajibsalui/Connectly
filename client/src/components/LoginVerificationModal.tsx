import React, { useState, useEffect } from 'react';
import { config } from "../config/config";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  IoPhonePortraitOutline, 
  IoCheckmarkCircle,
  IoReloadOutline,
  IoCloseOutline 
} from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';

interface LoginVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  phone: string;
  onVerificationComplete: () => void;
}

const LoginVerificationModal: React.FC<LoginVerificationModalProps > = ({
  isOpen,
  onClose,
  userId,
  phone,
  onVerificationComplete
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [phoneCode, setPhoneCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (isOpen) {
      sendVerificationCode();
    }
    return () => {
      setPhoneCode('');
      setIsVerified(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const sendVerificationCode = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${config.serverUrl}/auth/verify-phone/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification code');
      }
      
      toast.success('Verification code sent successfully');
      setResendTimer(60); // Start 60 second countdown
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.serverUrl}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({type:'phone', code: phoneCode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid verification code');
      }

      setIsVerified(true);
      toast.success('Phone verified successfully');
      onVerificationComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Verify Your Phone</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

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
                ${isVerified ? 'input-success' : ''}`}
              disabled={isVerified}
              maxLength={6}
            />
            <button
              onClick={verifyCode}
              className={`btn ${isVerified ? 'btn-success' : 'btn-primary'}`}
              disabled={isVerified || !phoneCode || phoneCode.length !== 6 || isLoading}
            >
              {isVerified ? <IoCheckmarkCircle className="w-5 h-5" /> : 'Verify'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <button
            onClick={sendVerificationCode}
            className="btn btn-outline gap-2"
            disabled={isLoading || resendTimer > 0}
          >
            <IoReloadOutline className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginVerificationModal;