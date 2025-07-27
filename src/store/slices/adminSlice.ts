import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  profilePhoto?: string;
}

export interface UsersPaginationMeta { totalUsers: number; page: number; limit: number; totalPages: number; }
export interface PropertiesPaginationMeta { totalProperties: number; page: number; limit: number; totalPages: number; }
export interface BookingsPaginationMeta { totalBookings: number; page: number; limit: number; totalPages: number; }
export interface ReviewsPaginationMeta { totalReviews: number; page: number; limit: number; totalPages: number; }

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

  admins: User[];
  saPage: number;
  saLimit: number;
  saTotal: number;
  saTotalPages: number;

  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [], usersPage: 1, usersLimit: 10, usersTotal: 0, usersTotalPages: 1,
  properties: [], propertiesPage: 1, propertiesLimit: 10, propertiesTotal: 0, propertiesTotalPages: 1,
  bookings: [], bookingsPage: 1, bookingsLimit: 10, bookingsTotal: 0, bookingsTotalPages: 1,
  reviews: [], reviewsPage: 1, reviewsLimit: 10, reviewsTotal: 0, reviewsTotalPages: 1,
  metrics: null,
  admins: [], saPage: 1, saLimit: 10, saTotal: 0, saTotalPages: 1,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (
    {
      page,
      limit,
      search = '',
    }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) {
        queryParams.append('search', search);
      }

      const response = await api.get(`api/admin/users?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : err instanceof Error
      ? err.message
      : 'Failed to fetch users';
    return rejectWithValue(msg);
  }
  }
);

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

export const fetchAdmins = createAsyncThunk<
  { data: User[]; meta: UsersPaginationMeta },
  { page: number; limit: number },
  { rejectValue: string }
>(
  'admin/fetchSuperAdmins',
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get(
        `api/super-admin/admins?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to load admins';
      return rejectWithValue(msg);
    }
  }
);

export const createAdmin = createAsyncThunk<
  { user: User; token: string },
  { email: string; name: string; password: string },
  { rejectValue: string }
>(
  'admin/createAdmin',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.post(
        `api/super-admin/admins`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to create admin';
      return rejectWithValue(msg);
    }
  }
);

export const deleteAdmin = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'admin/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `api/super-admin/admins/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return id;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error
        ? err.message
        : 'Failed to delete admin';
      return rejectWithValue(msg);
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
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = payload.data;
        state.usersPage = payload.meta.page;
        state.usersLimit = payload.meta.limit;
        state.usersTotal = payload.meta.totalUsers;
        state.usersTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = typeof payload === 'string' ? payload : 'Failed to load';
      });
    builder
      .addCase(changeUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserRole.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.users.findIndex(u => u.id === payload.user.id);
        if (idx >= 0) state.users[idx] = payload.user;
      })
      .addCase(changeUserRole.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to update role';
      });
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, { payload: userId }) => {
        state.loading = false;
        state.users = state.users.filter(u => u.id !== userId);
        state.usersTotal--;
        state.usersTotalPages = Math.ceil(state.usersTotal / state.usersLimit);
      })
      .addCase(deleteUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to delete user';
      });

    // ─── fetchProperties ───
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.properties = payload.data;
        state.propertiesPage = payload.meta.page;
        state.propertiesLimit = payload.meta.limit;
        state.propertiesTotal = payload.meta.totalProperties;
        state.propertiesTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchProperties.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to load properties';
      });

    // ─── approveProperty ───
    builder
      .addCase(approveProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.properties.findIndex(p => p.id === payload.id);
        if (idx >= 0) state.properties[idx] = payload;
      })
      .addCase(approveProperty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to approve property';
      });

    // ─── rejectProperty ───
    builder
      .addCase(rejectProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.properties.findIndex(p => p.id === payload.id);
        if (idx >= 0) state.properties[idx] = payload;
      })
      .addCase(rejectProperty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to reject property';
      });

    // ─── deletePropertyByAdmin ───
    builder
      .addCase(deletePropertyByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePropertyByAdmin.fulfilled, (state, { payload: propertyId }) => {
        state.loading = false;
        state.properties = state.properties.filter(p => p.id !== propertyId);
        state.propertiesTotal--;
        state.propertiesTotalPages = Math.ceil(state.propertiesTotal / state.propertiesLimit);
      })
      .addCase(deletePropertyByAdmin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to delete property';
      });

    // ─── fetchBookings ───
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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
        state.error = payload ?? 'Failed to load bookings';
      });

    // ─── updateBookingStatus ───
    builder
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.bookings.findIndex(b => b.id === payload.id);
        if (idx >= 0) state.bookings[idx] = payload;
      })
      .addCase(updateBookingStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to update booking status';
      });

    // ─── fetchReviews ───
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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
        state.error = payload ?? 'Failed to load reviews';
      });

    // ─── deleteReview ───
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, { payload: reviewId }) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r.id !== reviewId);
        state.reviewsTotal--;
        state.reviewsTotalPages = Math.ceil(state.reviewsTotal / state.reviewsLimit);
      })
      .addCase(deleteReview.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to delete review';
      });

    // ─── fetchMetrics ───
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.metrics = payload;
      })
      .addCase(fetchMetrics.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to load metrics';
      });

    // ─── fetchSuperAdmins ───
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.admins = payload.data;
        state.saPage = payload.meta.page;
        state.saLimit = payload.meta.limit;
        state.saTotal = payload.meta.totalUsers;
        state.saTotalPages = payload.meta.totalPages;
      })
      .addCase(fetchAdmins.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to load admins';
      });

    // ─── createAdmin ───
    builder
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.admins.unshift(payload.user);
        state.saTotal++;
        state.saTotalPages = Math.ceil(state.saTotal / state.saLimit);
      })
      .addCase(createAdmin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to create admin';
      });

    // ─── deleteAdmin ───
    builder
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.admins = state.admins.filter(a => a.id !== id);
        state.saTotal--;
        state.saTotalPages = Math.ceil(state.saTotal / state.saLimit);
      })
      .addCase(deleteAdmin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Failed to delete admin';
      });
  }
});
export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
