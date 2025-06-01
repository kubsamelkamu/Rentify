import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';

export interface PaymentState {
  statuses: Record<string, 'PENDING' | 'SUCCESS' | 'FAILED'>;
}

const initialState: PaymentState = {
  statuses: {},
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const initiatePayment = createAsyncThunk<
  { bookingId: string; checkoutUrl: string; paymentId: string },
  { bookingId: string },
  { rejectValue: string; state: RootState }
>(
  'payment/initiate',
  async ({ bookingId }, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue('Not authenticated');
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/payments/initiate`,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        bookingId,
        checkoutUrl: res.data.checkoutUrl,
        paymentId: res.data.paymentId,
      };
    } catch (err: unknown) {
      let message: string;
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }
      return rejectWithValue(message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentStatusUpdated: (
      state,
      action: PayloadAction<{
        bookingId: string;
        paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
      }>
    ) => {
      const { bookingId, paymentStatus } = action.payload;
      state.statuses[bookingId] = paymentStatus;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initiatePayment.fulfilled, (state, { payload }) => {
      state.statuses[payload.bookingId] = 'PENDING';
    });
  },
});

export const { paymentStatusUpdated } = paymentSlice.actions;
export default paymentSlice.reducer;
