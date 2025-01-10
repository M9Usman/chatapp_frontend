'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendOtpService } from '@/service/resendOtp';
import { verifyOtpService } from '@/service/verifyOtp';
import { useDispatch } from 'react-redux';
import { setToken } from '../../store/authSlice';

interface VerifyOtpResponse {
  verified: boolean;
  token?: string;  // Optional token field
}

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const dispatch = useDispatch();
  const userEmail = sessionStorage.getItem('user-email');
  const email = userEmail ?? '';

  useEffect(() => {
    console.log(email);
    if (!email) {
      router.push('/');  // Navigate to the welcome page if no valid token
    }
  }, [email, router]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    try {
     
      if (email) {
        const otpString = otp.join('');
        if (otpString.length === 6) {
          const verifyresponse = await verifyOtpService(email, otpString);
          const response: VerifyOtpResponse = verifyresponse.data;  // Use the defined interface
          console.log(response);
          dispatch(setToken(response.token!));
          if (response.verified) {
            router.push('/dashboard');
          } else {
            router.push('/otp-verification-failed');
          }
        } else {
          console.warn('OTP is incomplete');
          alert('OTP is incomplete');
        }
      }
    } catch (e) {
      alert('Wrong OTP please recheck otp on your email.');
      console.error('Error while Verifying OTP:', e);
    }
  };

  const handleResendOtp = async () => {
    try {
      const userEmail = sessionStorage.getItem('user-email');
      const email = userEmail ?? '';

      if (email) {
        const response = await resendOtpService(email);
        console.log('Resend OTP response:', response);
      } else {
        console.error('No email found in session storage.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <Card className="w-[400px] bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">OTP Verification</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter the 6-digit code sent to your email or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleBackspace(e, index)}
                maxLength={1}
                className="w-12 h-12 text-center text-xl bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button
            onClick={handleVerify}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            disabled={otp.some((digit) => !digit) || otp.join('').length !== 6}
          >
            Verify OTP
          </Button>
          <Button
            onClick={handleResendOtp}
            className="bg-white hover:bg-black hover:text-white text-black transition"
          >
            Resend OTP
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
