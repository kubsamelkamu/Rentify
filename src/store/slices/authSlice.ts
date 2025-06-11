import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/api';
import { changeUserRole } from '@/store/slices/adminSlice';

type Role = 'TENANT' | 'LANDLORD' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt: string;
}

type AuthState = {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk<void, { name: string; email: string; password: string }, { rejectValue: string }>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/register', userData);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data as { user: User; token: string };
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/me');
      return response.data as User;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  }
);

export const saveProfile = createAsyncThunk<User, FormData, { rejectValue: string }>(
  'auth/saveProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data as User;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to save profile';
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to send reset email';
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk<void, { token: string; newPassword: string }, { rejectValue: string }>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/reset-password', data);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Password reset failed';
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      await api.get(`/api/auth/verify?token=${token}`);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Email verification failed';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
    setAuth(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'succeeded';
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state) => { state.status = 'succeeded'; state.loading = false; });
    builder.addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Registration failed'; });

    builder.addCase(loginUser.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    });
    builder.addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Login failed'; });

    builder.addCase(fetchCurrentProfile.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; });
    builder.addCase(fetchCurrentProfile.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(fetchCurrentProfile.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Failed to load profile'; });

    builder.addCase(saveProfile.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; });
    builder.addCase(saveProfile.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(saveProfile.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Failed to save profile'; });

    builder.addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(forgotPassword.fulfilled, (state) => { state.loading = false; });
    builder.addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to send reset email'; });

    builder.addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(resetPassword.fulfilled, (state) => { state.loading = false; });
    builder.addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Password reset failed'; });

    builder.addCase(verifyEmail.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(verifyEmail.fulfilled, (state) => { state.loading = false; });
    builder.addCase(verifyEmail.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Email verification failed'; });

    builder.addCase(changeUserRole.fulfilled, (state, action) => {
      const { user: updatedUser, token: updatedToken } = action.payload;
      if (state.user && state.user.id === updatedUser.id) {
        state.token = updatedToken;
        localStorage.setItem('token', updatedToken);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      state.error = null;
      state.loading = false;
    });
    builder.addCase(changeUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update role';
    });
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
