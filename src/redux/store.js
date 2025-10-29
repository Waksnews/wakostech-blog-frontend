import { createSlice, configureStore } from "@reduxjs/toolkit";

// Your existing auth slice - KEEP AS IS
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLogin: false,
  },
  reducers: {
    login(state) {
      state.isLogin = true;
    },
    logout(state) {
      state.isLogin = false;
    },
  },
});

// NEW: Profile slice - ADD THIS
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    userProfile: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileSuccess: (state) => {
      state.success = false;
    },
  },
});

// Export your existing actions - KEEP AS IS
export const authActions = authSlice.actions;
export const profileActions = profileSlice.actions; // NEW: Export profile actions

// Update store to include both reducers
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,      // Your existing auth reducer
    profile: profileSlice.reducer, // NEW: Add profile reducer
  },
});