import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';
import axios from 'axios';
import { changeUserRole } from './adminSlices';



export const registerUser = createAsyncThunk<
  void,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    await api.post('/api/auth/register', userData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return rejectWithValue(message);
  }
});

export const resendVerification = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>('auth/resendVerification', async ({ email }, { rejectWithValue }) => {
  try {
    await api.post('/api/auth/resend-verification', { email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return rejectWithValue(message);
  }
});

export const fetchCurrentProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch profile');
  }
});

// 5️⃣ Save Profile
export const saveProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>('auth/saveProfile', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.put('/api/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to save profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.loading = false;
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
      state.error = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Registration failed';
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload || action.error.message || 'Login failed';
      })

      // resendVerification
      .addCase(resendVerification.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Resend failed';
      })

      // fetchCurrentProfile
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Fetch profile failed';
      })

      // saveProfile
      .addCase(saveProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Save profile failed';
      })

      // changeUserRole
      .addCase(changeUserRole.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Role update failed';
      });
  },
});

export const { logout, clearError, setAuth } = authSlice.actions;
export default authSlice.reducer;
