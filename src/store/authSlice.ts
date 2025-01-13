import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode correctly

// Define the shape of the authentication state
export interface AuthState {
  user: Record<string, any> | null; // User data from the decoded token
  token: string | null; // JWT token
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Sets the token in the state and decodes it to extract user information.
     * @param state - Current state
     * @param action - Redux action with the token payload
     */
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      try {
        const decoded = jwtDecode<Record<string, any>>(action.payload); // Decode token
        state.user = decoded; // Update the user state with decoded token data
      } catch (error) {
        console.error('Invalid token:', error); // Handle invalid token
        state.token = null;
        state.user = null;
      }
    },
    /**
     * Clears the token and user information from the state.
     * @param state - Current state
     */
    clearToken: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

// Export actions
export const { setToken, clearToken } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
