'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginService } from 'src/service/login';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setToken } from '../store/authSlice';

interface Response {
  isVerified: boolean;
  message: string;
  token?: string; // Optional token
}


export default function WelcomePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true); // Track user type
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleJoin = async () => {
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Sending OTP, please wait...');

    try {
      const axiosResponse = await loginService(email, isFirstTime ? name : '');
      const response: Response = axiosResponse.data;

      toast.update(toastId, {
        render: 'OTP sent successfully! Check your email.',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      sessionStorage.setItem('user-email', email);

      if (response.isVerified) {
        // Safely handle undefined token
        dispatch(setToken(response.token!));  // using non-null assertion operator (!)
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setTimeout(() => {
          router.push('/otp-verification');
        }, 500);
      }
    } catch (error) {
      console.error('Signup Error:', error);

      toast.update(toastId, {
        render: 'Failed to send OTP. Please try again.',
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
          <CardContent className="text-sm text-gray-300 text-center">"Welcome to ChatApp" is a friendly greeting that you might see when you first open a chat application. Think of it like entering a café where people gather to talk.
          ChatApp is designed for online communication, allowing users to connect and chat with each other. The phrase invites both new users, who might be joining for the first time, and returning users, who are already familiar with the platform.
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
            onClick={handleJoin}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={(!isFirstTime && !email.trim()) || (isFirstTime && (!name.trim() || !email.trim())) || isLoading}
            aria-disabled={(!isFirstTime && !email.trim()) || (isFirstTime && (!name.trim() || !email.trim())) || isLoading}
          >
            {isLoading ? 'Sending...' : 'Join ChatApp'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
