import { store } from '@/store/store';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to attach the Authorization token from Redux store
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token; // Access token from Redux state
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Logout function that sends a POST request to '/logout'
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    console.error('Logout error:', {
      message: error.message,
      requestConfig: {
        method: 'POST',
        url: '/logout',
        headers: api.defaults.headers,
      },
      responseData: error.response ? error.response.data : null,
      status: error.response ? error.response.status : null,
    });
    throw error;
  }
};

// Get all users function that sends a GET request to '/'
export const getAllUsers = async () => {
  try {
    const response = await api.get('/auth');
    return response.data;
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

// Get chat groups function that sends a GET request to '/chat/groups'
export const getChatGroups = async () => {
  try {
    const response = await api.get('/chat/groups');
    return response.data;
  } catch (error) {
    console.error('Get chat groups error:', error);
    throw error;
  }
};

export default api;
