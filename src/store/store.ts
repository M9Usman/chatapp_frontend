import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';  // Adjust the path to your authSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,  // Add the auth reducer here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState}
export type AppDispatch = typeof store.dispatch;
