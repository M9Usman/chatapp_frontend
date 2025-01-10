import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode

// Define the shape of the authentication state
export interface AuthState {
  user: Record<string, any> | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      try {
        const decoded = jwtDecode(action.payload);
        state.user = decoded;
      } catch (error) {
        console.error('Invalid token:', error);
        state.token = null;
        state.user = null;
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;

export default authSlice.reducer;
