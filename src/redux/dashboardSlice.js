import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for dashboard operations
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/dashboard/overview');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchContentCalendar = createAsyncThunk(
  'dashboard/fetchContentCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/dashboard/calendar');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchEnhancedAnalytics = createAsyncThunk(
  'dashboard/fetchEnhancedAnalytics',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v1/dashboard/enhanced-analytics?period=${period}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'dashboard/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/dashboard/user-stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    overview: null,
    contentCalendar: null,
    analytics: null,
    userStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.overview = null;
      state.contentCalendar = null;
      state.analytics = null;
      state.userStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.data;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch dashboard data';
      })
      // Fetch Content Calendar
      .addCase(fetchContentCalendar.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContentCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.contentCalendar = action.payload;
      })
      .addCase(fetchContentCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch content calendar';
      })
      // Fetch Enhanced Analytics
      .addCase(fetchEnhancedAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnhancedAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchEnhancedAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch analytics';
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch user stats';
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;