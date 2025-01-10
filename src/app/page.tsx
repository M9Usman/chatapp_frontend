'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { loginService } from 'src/service/login';
import { resendOtpService } from 'src/service/resendOtp';
import { setToken } from '../store/authSlice';

export default function WelcomePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAction = async () => {
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Processing, please wait...');

    try {
      if (isFirstTime) {
        const axiosResponse = await loginService(email, name);
        const response = axiosResponse.data;

        toast.update(toastId, {
          render: 'OTP sent successfully! Check your email.',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });

        sessionStorage.setItem('user-email', email);

        if (response.isVerified) {
          dispatch(setToken(response.token!));
          router.push('/dashboard');
        } else {
          router.push('/otp-verification');
        }
      } else {
        const axiosResponse = await resendOtpService(email);
        const response = axiosResponse.data;

        if (response.isVerified) {
          dispatch(setToken(response.token!));
          router.push('/dashboard');
        } else {
          toast.update(toastId, {
            render: 'OTP resent successfully! Check your email.',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });

          sessionStorage.setItem('user-email', email);
          router.push('/otp-verification');
        }
      }
    } catch (error) {
      console.error('Error:', error);

      toast.update(toastId, {
        render: 'An error occurred. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/002/099/717/non_2x/mountain-beautiful-landscape-background-design-illustration-free-vector.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000E0] to-[#00000040] opacity-100" />

      <Card className="w-[350px] bg-black/10 backdrop-blur-md border-gray-100/20 z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome to ChatApp</CardTitle>
          <CardContent className="text-sm text-gray-300 text-center">
            "Welcome to ChatApp" is a friendly greeting when you first open a chat application. Think of it like entering a café where people gather to talk.
          </CardContent>
          <CardDescription className="text-center text-white">Join the conversation!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 justify-center mb-4">
            <Button
              onClick={() => setIsFirstTime(true)}
              className={`text-white ${isFirstTime ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              First Time
            </Button>
            <Button
              onClick={() => setIsFirstTime(false)}
              className={`text-white ${!isFirstTime ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Already a User
            </Button>
          </div>
          <div className="space-y-4">
            {isFirstTime && (
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/80 border-gray-200/20 text-black placeholder-black"
                autoFocus
              />
            )}
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/80 border-gray-200/20 text-black placeholder-black"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={handleAction}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={!email.trim() || (isFirstTime && !name.trim()) || isLoading}
          >
            {isLoading ? 'Processing...' : isFirstTime ? 'Join ChatApp' : 'Resend OTP'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
