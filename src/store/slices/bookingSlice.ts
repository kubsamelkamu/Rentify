import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/api';
import axios from 'axios';

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    city: string;
    rentPerMonth: number;
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
  payment?: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    amount: number;
    currency: string;
    transactionId: string;
  };
}

interface BookingState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  items: [],
  loading: false,
  error: null,
};

export const requestBooking = createAsyncThunk<
  Booking,
  { propertyId: string; startDate: string; endDate: string },
  { rejectValue: string }
>(
  'booking/request',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/bookings', payload);
      return res.data as Booking;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error occured while request Booking.');
    }
  }
);

export const fetchUserBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>(
  'booking/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/bookings/user');
      return res.data as Booking[];
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error occured while Fetching User Booking.');
    }
  }
);

export const fetchPropertyBookings = createAsyncThunk<
  Booking[],
  string,
  { rejectValue: string }
>(
  'booking/fetchProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/bookings/property/${propertyId}`);
      return res.data as Booking[];
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error Occured while Fetching Property Booking.');
    }
  }
);

export const fetchLandlordBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>(
  'booking/fetchLandlord',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/bookings/landlord');
      return res.data as Booking[];
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error Occured while Fetching Landlord Booking.');
    }
  }
);

export const confirmBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>(
  'booking/confirm',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/bookings/${bookingId}/confirm`);
      return res.data as Booking;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error Occured while Confirming Booking.');
    }
  }
);


export const rejectBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>(
  'booking/reject',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/bookings/${bookingId}/reject`);
      return res.data as Booking;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error Occured while Rejecting Booking');
    }
  }
);

export const cancelBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>(
  'booking/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/bookings/${bookingId}`);
      return res.data as Booking;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An Error Occured While Cancelling Booking.');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    updateBookingInStore(state, action: PayloadAction<Booking>) {
      const idx = state.items.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items.unshift(payload);
      })
      .addCase(requestBooking.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not request booking';
      });
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchUserBookings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not load your bookings';
      });
    builder
      .addCase(fetchPropertyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchPropertyBookings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not load property bookings';
      });
    builder
      .addCase(fetchLandlordBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandlordBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchLandlordBookings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not load landlord bookings';
      });
    builder
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.items.findIndex((b) => b.id === payload.id);
        if (idx >= 0) state.items[idx] = payload;
      })
      .addCase(confirmBooking.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not confirm booking';
      });
    builder
      .addCase(rejectBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.items.findIndex((b) => b.id === payload.id);
        if (idx >= 0) state.items[idx] = payload;
      })
      .addCase(rejectBooking.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not reject booking';
      });
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.items.findIndex((b) => b.id === payload.id);
        if (idx >= 0) state.items[idx] = payload;
      })
      .addCase(cancelBooking.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload ?? 'Could not cancel booking';
      });
  },
});

export const { updateBookingInStore } = bookingSlice.actions;
export default bookingSlice.reducer;
