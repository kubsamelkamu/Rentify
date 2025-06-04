import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  city: string;
  rentPerMonth: number;
  landlordId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: string;
  tenant: { id: string; name: string; email: string };
  property: { id: string; title: string; city: string; rentPerMonth: number };
  payment: { status: 'PENDING' | 'SUCCESS' | 'FAILED'; amount: number; paidAt: string | null } | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  tenant: { id: string; name: string };
  property: { id: string; title: string };
}

export interface Metrics {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalReviews: number;
  totalRevenue: number;
}

interface AdminState {
  users: User[];
  properties: Property[];
  bookings: Booking[];
  reviews: Review[];
  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  properties: [],
  bookings: [],
  reviews: [],
  metrics: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data as User[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const changeUserRole = createAsyncThunk<
  User,
  { userId: string; role: 'TENANT' | 'LANDLORD' | 'ADMIN' },
  { rejectValue: string }
>(
  'admin/changeUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/users/${userId}/role`, { role });
      return response.data as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/users/${userId}`);
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchProperties = createAsyncThunk<Property[], void, { rejectValue: string }>(
  'admin/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/properties');
      return response.data as Property[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deletePropertyByAdmin = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/properties/${propertyId}`);
      return propertyId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchBookings = createAsyncThunk<Booking[], void, { rejectValue: string }>(
  'admin/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/bookings');
      return response.data as Booking[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk<
  Booking,
  { bookingId: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' },
  { rejectValue: string }
>(
  'admin/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/bookings/${bookingId}/status`, { status });
      return response.data as Booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchReviews = createAsyncThunk<Review[], void, { rejectValue: string }>(
  'admin/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/reviews');
      return response.data as Review[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteReview = createAsyncThunk<string, string, { rejectValue: string }>(
  'admin/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/reviews/${reviewId}`);
      return reviewId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchMetrics = createAsyncThunk<Metrics, void, { rejectValue: string }>(
  'admin/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/metrics');
      return response.data as Metrics;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load users';
    });
    builder.addCase(changeUserRole.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changeUserRole.fulfilled, (state, action: PayloadAction<User>) => {
      state.loading = false;
      const idx = state.users.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) state.users[idx] = action.payload;
    });
    builder.addCase(changeUserRole.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to update user role';
    });
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete user';
    });
    builder.addCase(fetchProperties.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
      state.loading = false;
      state.properties = action.payload;
    });
    builder.addCase(fetchProperties.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load properties';
    });
    builder.addCase(deletePropertyByAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deletePropertyByAdmin.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.properties = state.properties.filter((p) => p.id !== action.payload);
    });
    builder.addCase(deletePropertyByAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete property';
    });

    builder.addCase(fetchBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
      state.loading = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load bookings';
    });
    builder.addCase(updateBookingStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<Booking>) => {
      state.loading = false;
      const idx = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) state.bookings[idx] = action.payload;
    });
    builder.addCase(updateBookingStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to update booking status';
    });
    builder.addCase(fetchReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
      state.loading = false;
      state.reviews = action.payload;
    });
    builder.addCase(fetchReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load reviews';
    });
    builder.addCase(deleteReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteReview.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
    });
    builder.addCase(deleteReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to delete review';
    });
    
    builder.addCase(fetchMetrics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMetrics.fulfilled, (state, action: PayloadAction<Metrics>) => {
      state.loading = false;
      state.metrics = action.payload;
    });
    builder.addCase(fetchMetrics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to load metrics';
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
