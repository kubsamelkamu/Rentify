import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../utils/api';

export interface Property {
  id: string;
  title: string;
  city: string;
  rentPerMonth: number;
  landlordId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
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

export interface PropertiesPaginationMeta { totalProperties: number; page: number; limit: number; totalPages: number; }
export interface UsersPaginationMeta      { totalUsers: number;      page: number; limit: number; totalPages: number; }
export interface BookingsPaginationMeta   { totalBookings: number;   page: number; limit: number; totalPages: number; }
export interface ReviewsPaginationMeta    { totalReviews: number;    page: number; limit: number; totalPages: number; }

interface AdminState {
  users: User[];
  usersPage: number;
  usersLimit: number;
  usersTotal: number;
  usersTotalPages: number;

  properties: Property[];
  propertiesPage: number;
  propertiesLimit: number;
  propertiesTotal: number;
  propertiesTotalPages: number;

  bookings: Booking[];
  bookingsPage: number;
  bookingsLimit: number;
  bookingsTotal: number;
  bookingsTotalPages: number;

  reviews: Review[];
  reviewsPage: number;
  reviewsLimit: number;
  reviewsTotal: number;
  reviewsTotalPages: number;

  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [], usersPage: 1, usersLimit: 10, usersTotal: 0, usersTotalPages: 1,
  properties: [], propertiesPage: 1, propertiesLimit: 10, propertiesTotal: 0, propertiesTotalPages: 1,
  bookings: [], bookingsPage: 1, bookingsLimit: 10, bookingsTotal: 0, bookingsTotalPages: 1,
  reviews: [], reviewsPage: 1, reviewsLimit: 10, reviewsTotal: 0, reviewsTotalPages: 1,
  metrics: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  { data: User[]; meta: UsersPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>('admin/fetchUsers', async ({ page, limit }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/admin/users?page=${page}&limit=${limit}`);
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch users';
    return rejectWithValue(msg);
  }
});

// Change user role
export const changeUserRole = createAsyncThunk<
  { user: User; token: string },
  { userId: string; role: User['role'] },
  { rejectValue: string }
>('admin/changeUserRole', async ({ userId, role }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/api/users/${userId}/role`, { role });
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to change user role';
    return rejectWithValue(msg);
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('admin/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/admin/users/${userId}`);
    return userId;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to delete user';
    return rejectWithValue(msg);
  }
});

export const fetchProperties = createAsyncThunk<
  { data: Property[]; meta: PropertiesPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>('admin/fetchProperties', async ({ page, limit }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/admin/properties?page=${page}&limit=${limit}`);
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch properties';
    return rejectWithValue(msg);
  }
});

export const deletePropertyByAdmin = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('admin/deleteProperty', async (propertyId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/admin/properties/${propertyId}`);
    return propertyId;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to delete property';
    return rejectWithValue(msg);
  }
});

export const approveProperty = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>('admin/approveProperty', async (propertyId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/api/admin/properties/${propertyId}/approve`);
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to approve property';
    return rejectWithValue(msg);
  }
});

export const rejectProperty = createAsyncThunk<
  Property,
  { propertyId: string; reason: string },
  { rejectValue: string }
>('admin/rejectProperty', async ({ propertyId, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(
      `/api/admin/properties/${propertyId}/reject`,
      { reason }
    );
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to reject property';
    return rejectWithValue(msg);
  }
});

export const fetchBookings = createAsyncThunk<
  { data: Booking[]; meta: BookingsPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>('admin/fetchBookings', async ({ page, limit }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/admin/bookings?page=${page}&limit=${limit}`);
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch bookings';
    return rejectWithValue(msg);
  }
});

export const updateBookingStatus = createAsyncThunk<
  Booking,
  { bookingId: string; status: Booking['status'] },
  { rejectValue: string }
>('admin/updateBookingStatus', async ({ bookingId, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/api/admin/bookings/${bookingId}/status`, { status });
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to update booking status';
    return rejectWithValue(msg);
  }
});

export const fetchReviews = createAsyncThunk<
  { data: Review[]; meta: ReviewsPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>('admin/fetchReviews', async ({ page, limit }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/admin/reviews?page=${page}&limit=${limit}`);
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch reviews';
    return rejectWithValue(msg);
  }
});

export const deleteReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('admin/deleteReview', async (reviewId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/admin/reviews/${reviewId}`);
    return reviewId;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to delete review';
    return rejectWithValue(msg);
  }
});

export const fetchMetrics = createAsyncThunk<
  Metrics,
  void,
  { rejectValue: string }
>('admin/fetchMetrics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/admin/metrics');
    return data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch metrics';
    return rejectWithValue(msg);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addProperty(state, action: PayloadAction<Property>) {
      state.properties.unshift(action.payload);
      state.propertiesTotal++;
      state.propertiesTotalPages = Math.ceil(state.propertiesTotal / state.propertiesLimit);
    },
    updateProperty(state, action: PayloadAction<Property>) {
      const idx = state.properties.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.properties[idx] = action.payload;
    },
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsers.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.users = payload.data;
        s.usersPage = payload.meta.page;
        s.usersLimit = payload.meta.limit;
        s.usersTotal = payload.meta.totalUsers;
        s.usersTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchUsers.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to load users';
      })
    builder
      .addCase(changeUserRole.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(changeUserRole.fulfilled, (s, { payload }) => {
        s.loading = false;
        const idx = s.users.findIndex(u => u.id === payload.user.id);
        if (idx >= 0) s.users[idx] = payload.user;
      })
      .addCase(changeUserRole.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to update role';
      })
    builder
      .addCase(deleteUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.users = s.users.filter(u => u.id !== payload);
        s.usersTotal--;
        s.usersTotalPages = Math.ceil(s.usersTotal / s.usersLimit);
      })
      .addCase(deleteUser.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to delete user';
      })
    builder
      .addCase(fetchProperties.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProperties.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.properties = payload.data;
        s.propertiesPage = payload.meta.page;
        s.propertiesLimit = payload.meta.limit;
        s.propertiesTotal = payload.meta.totalProperties;
        s.propertiesTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchProperties.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to load properties';
      })
    builder
      .addCase(approveProperty.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(approveProperty.fulfilled, (s, { payload }) => {
        s.loading = false;
        const idx = s.properties.findIndex(p => p.id === payload.id);
        if (idx >= 0) s.properties[idx] = payload;
      })
      .addCase(approveProperty.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to approve property';
      })
    builder
      .addCase(rejectProperty.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(rejectProperty.fulfilled, (s, { payload }) => {
        s.loading = false;
        const idx = s.properties.findIndex(p => p.id === payload.id);
        if (idx >= 0) s.properties[idx] = payload;
      })
      .addCase(rejectProperty.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to reject property';
      })
    builder
      .addCase(deletePropertyByAdmin.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deletePropertyByAdmin.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.properties = s.properties.filter(p => p.id !== payload);
        s.propertiesTotal--;
        s.propertiesTotalPages = Math.ceil(s.propertiesTotal / s.propertiesLimit);
      })
      .addCase(deletePropertyByAdmin.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload || 'Failed to delete property';
      })
      .addCase(fetchBookings.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.bookings = payload.data;
        state.bookingsPage = payload.meta.page;
        state.bookingsLimit = payload.meta.limit;
        state.bookingsTotal = payload.meta.totalBookings;
        state.bookingsTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to load bookings';
      })

      .addCase(updateBookingStatus.pending, state => { state.loading = true; state.error = null; })
      .addCase(updateBookingStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.bookings.findIndex(b => b.id === payload.id);
        if (idx >= 0) state.bookings[idx] = payload;
      })
      .addCase(updateBookingStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to update booking';
      })
      .addCase(fetchReviews.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchReviews.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.reviews = payload.data;
        state.reviewsPage = payload.meta.page;
        state.reviewsLimit = payload.meta.limit;
        state.reviewsTotal = payload.meta.totalReviews;
        state.reviewsTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchReviews.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to load reviews';
      })
      .addCase(deleteReview.pending, state => { state.loading = true; state.error = null; })
      .addCase(deleteReview.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r.id !== payload);
        state.reviewsTotal--;
        state.reviewsTotalPages = Math.ceil(state.reviewsTotal / state.reviewsLimit);
      })
      .addCase(deleteReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to delete review';
      })
      .addCase(fetchMetrics.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchMetrics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.metrics = payload;
      })
      .addCase(fetchMetrics.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to load metrics';
      });
  }
});

export const { addProperty, updateProperty, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;


