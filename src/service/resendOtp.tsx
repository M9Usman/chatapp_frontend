import axios from 'axios';

export const resendOtpService = async (email: string) => {
  try {
    const response = await axios.post('http://localhost:4000/auth/resend-otp', {
      email,
    });
    
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error; // Optional, you can choose to handle errors differently
  }
};
