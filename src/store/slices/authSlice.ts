import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/api';
import { changeUserRole } from './adminSlice';
type Role = 'TENANT' | 'LANDLORD' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profilePhoto?: string | null;
  createdAt: string;
  updatedAt?: string;
  isVerified: boolean;
}

type AuthState = {
  user: User | null;
  email: string | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  email: null,
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
  { user: User; token: string; isVerified: boolean },
  { email: string; password: string },
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, token } = response.data as { user: User; token: string };
      const isVerified =
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          ? true
          : user.isVerified;

      return { user, token, isVerified };
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

export const verifyOtp = createAsyncThunk<{ user: User; token: string }, { email: string; otp: string }, { rejectValue: string }>(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp });
      return response.data as { user: User; token: string };
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'OTP verification failed';
      return rejectWithValue(message);
    }
  }
);

export const resendOtp = createAsyncThunk<void, string, { rejectValue: string }>(
  'auth/resendOtp',
  async (email, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/resend-otp', { email });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to resend OTP';
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
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

export const fetchCurrentProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
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

export const saveProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>(
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

export const applyForLandlord = createAsyncThunk<
  void,
  FormData,
  { rejectValue: string }
>(
  'auth/applyForLandlord',
  async (formData, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/apply-landlord', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to apply for landlord';
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  { token: string; newPassword: string },
  { rejectValue: string }
>(
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
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; })
           .addCase(registerUser.fulfilled, (state) => { state.status = 'succeeded'; state.loading = false; })
           .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Registration failed'; });
    builder.addCase(loginUser.pending, (state) => { state.status = 'loading'; state.loading = true; state.error = null; })
           .addCase(loginUser.fulfilled, (state, action) => {
              state.status = 'succeeded';
              state.loading = false;
              const { user, token, isVerified } = action.payload;
              state.user = user;
              state.token = token;
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              if (!isVerified && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
                state.error = 'Account not verified';
              } else {
                state.error = null;
              }
           })
           .addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.loading = false; state.error = action.payload || 'Login failed'; });
    builder.addCase(verifyOtp.pending, (state) => { state.loading = true; state.error = null; })
           .addCase(verifyOtp.fulfilled, (state, action) => {
              state.loading = false;
              state.user = action.payload.user;
              state.token = action.payload.token;
              state.status = 'succeeded';
              state.error = null;
              localStorage.setItem('token', action.payload.token);
              localStorage.setItem('user', JSON.stringify(action.payload.user));
           })
           .addCase(verifyOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'OTP verification failed'; });
    builder.addCase(resendOtp.pending, (state) => { state.loading = true; state.error = null; })
           .addCase(resendOtp.fulfilled, (state) => { state.loading = false; })
           .addCase(resendOtp.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Failed to resend OTP'; });
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send reset email';
      });
          builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Password reset failed';
      });
        // fetchCurrentProfile
    builder
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload || 'Failed to load profile';
      });
          // changeUserRole — update both user & token immediately
    builder
      .addCase(changeUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const { user: updatedUser, token: updatedToken } = action.payload;
        state.token = updatedToken;
        localStorage.setItem('token', updatedToken);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        state.loading = false;
        state.error = null;
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update role';
      });
    // saveProfile
    builder
      .addCase(saveProfile.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload || 'Failed to save profile';
      });
      builder
      .addCase(applyForLandlord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyForLandlord.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyForLandlord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to apply for landlord';
      });

  },
});

export const { logout, clearError, setAuth, setEmail } = authSlice.actions;
export default authSlice.reducer;
