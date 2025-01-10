import { store } from '@/store/store';
import axios from 'axios';


const API_URL = 'http://localhost:4000/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token; // Access token from Redux state
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const logout = async (userId: number) => {
  try {
    const response = await api.post('/logout', { userId });
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

export default api;

