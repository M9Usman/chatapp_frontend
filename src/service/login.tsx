// src/service/login.tsx

import axios from 'axios';

export const loginService = async (email: string, name: string) => {
  try {
    const username=name||'name';

    console.log(email,username);
    const response = await axios.post('http://localhost:4000/auth/login', {
      email,
      name:username,
    });
    
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error; // Optional, you can choose to handle errors differently
  }
};
