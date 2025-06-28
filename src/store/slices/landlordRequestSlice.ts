import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/api';

export interface LandlordDoc {
  id: string;
  url: string;
  docType: string;
  status: string;
}

export interface LandlordRequest {
  id: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  landlordDocs: LandlordDoc[];
  requestStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

interface LandlordRequestState {
  requests: LandlordRequest[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalRequests: number;
}

const initialState: LandlordRequestState = {
  requests: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  totalRequests: 0,
};

export const fetchLandlordRequests = createAsyncThunk<
  {
    requests: LandlordRequest[];
    page: number;
    totalPages: number;
    totalRequests: number;
  },
  { page: number; limit: number; status?: 'PENDING' | 'APPROVED' | 'REJECTED' },
  { rejectValue: string }
>(
  'landlordRequests/fetch',
  async ({ page, limit, status = 'PENDING' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/landlord-requests', {
        params: { page, limit, status },
      });
      return response.data as {
        requests: LandlordRequest[];
        page: number;
        totalPages: number;
        totalRequests: number;
      };
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to fetch requests';
      return rejectWithValue(message);
    }
  }
);

export const approveLandlordRequest = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'landlordRequests/approve',
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/api/admin/landlord-requests/${userId}/approve`);
      return userId;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Approval failed';
      return rejectWithValue(message);
    }
  }
);

export const rejectLandlordRequest = createAsyncThunk<
  string,
  { userId: string; reason: string },
  { rejectValue: string }
>(
  'landlordRequests/reject',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      await api.post(`/api/admin/landlord-requests/${userId}/reject`, { reason });
      return userId;
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Rejection failed';
      return rejectWithValue(message);
    }
  }
);

const landlordRequestSlice = createSlice({
  name: 'landlordRequests',
  initialState,
  reducers: {
    clearLandlordRequestError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandlordRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandlordRequests.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.requests      = payload.requests;
        state.page          = payload.page;
        state.totalPages    = payload.totalPages;
        state.totalRequests = payload.totalRequests;
      })
      .addCase(fetchLandlordRequests.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload || 'Failed to fetch landlord requests';
      });
    builder
      .addCase(approveLandlordRequest.fulfilled, (state, { payload: userId }) => {
        state.requests      = state.requests.filter((r) => r.id !== userId);
        state.totalRequests = Math.max(state.totalRequests - 1, 0);
      })
      .addCase(approveLandlordRequest.rejected, (state, { payload }) => {
        state.error = payload || 'Failed to approve request';
      });
    builder
      .addCase(rejectLandlordRequest.fulfilled, (state, { payload: userId }) => {
        state.requests      = state.requests.filter((r) => r.id !== userId);
        state.totalRequests = Math.max(state.totalRequests - 1, 0);
      })
      .addCase(rejectLandlordRequest.rejected, (state, { payload }) => {
        state.error = payload || 'Failed to reject request';
      });
  },
});

export const { clearLandlordRequestError } = landlordRequestSlice.actions;
export default landlordRequestSlice.reducer;
