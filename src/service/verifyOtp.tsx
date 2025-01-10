import axios from 'axios';

export const verifyOtpService = async (email: string,otp:string) => {
  try {
    const response = await axios.post('http://localhost:4000/auth/verify-otp', {
      email,otp
    });
    
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error; // Optional, you can choose to handle errors differently
  }
};
