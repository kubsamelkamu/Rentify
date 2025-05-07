import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  }
);

interface AuthState {
  user: null | { id: string; name: string; email: string; role: string };
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.status = 'loading'; })
      .addCase(registerUser.fulfilled, (state) => { state.status = 'succeeded'; })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to register';
      })
      .addCase(loginUser.pending, (state) => { state.status = 'loading'; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to login';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;