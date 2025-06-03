import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/api';

export interface Review {
  id: string;
  tenantId: string;
  propertyId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
}

export interface FetchResponse {
  reviews: Review[];
  averageRating: number;
  count: number;
  page: number;
  limit: number;
}

export const fetchPropertyReviews = createAsyncThunk<
  FetchResponse,                              
  { propertyId: string; page: number; limit: number },
  { rejectValue: string }                     
>(
  'reviews/fetchProperty',
  async (args, { rejectWithValue }) => {
    const { propertyId, page, limit } = args;
    try {
      const response = await api.get(
        `/api/reviews/${propertyId}?page=${page}&limit=${limit}`
      );
      return response.data as FetchResponse;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to fetch reviews');
    }
  }
);

export const upsertReview = createAsyncThunk<
  Review, 
  {
    propertyId: string;
    rating: number;
    title: string;
    comment: string;
  },
  { rejectValue: string }
>(
  'reviews/upsert',
  async (payload, { rejectWithValue }) => {
    const { propertyId, rating, title, comment } = payload;
    try {
      const response = await api.post(`/api/reviews/${propertyId}`, {
        rating,
        title,
        comment,
      });
      return response.data as Review;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to save review');
    }
  }
);


export const deleteReview = createAsyncThunk<
  { success: boolean; propertyId: string }, 
  string,                                   
  { rejectValue: string }          
>(
  'reviews/delete',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/reviews/${propertyId}`);
      return { ...(response.data as { success: boolean }), propertyId };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('Failed to delete review');
    }
  }
);


interface ReviewBucket {
  loading: boolean;
  error: string | null;
  reviews: Review[];
  averageRating: number;
  count: number; 
  page: number;   
  limit: number;   
}

interface ReviewState {
  reviewsByProperty: Record<string, ReviewBucket>;
  upsertLoading: boolean;
  upsertError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

const initialState: ReviewState = {
  reviewsByProperty: {},
  upsertLoading: false,
  upsertError: null,
  deleteLoading: false,
  deleteError: null,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewsForProperty: (state, action: PayloadAction<string>) => {
      delete state.reviewsByProperty[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPropertyReviews.pending, (state, action) => {
      const { propertyId, page, limit } = action.meta.arg;
      state.reviewsByProperty[propertyId] = {
        loading: true,
        error: null,
        reviews: [],
        averageRating: 0,
        count: 0,
        page,
        limit,
      };
    });

    builder.addCase(fetchPropertyReviews.fulfilled, (state, action) => {
      const { propertyId, page, limit } = action.meta.arg;
      const { reviews, averageRating, count } = action.payload;
      state.reviewsByProperty[propertyId] = {
        loading: false,
        error: null,
        reviews,
        averageRating,
        count,
        page,
        limit,
      };
    });

    builder.addCase(fetchPropertyReviews.rejected, (state, action) => {
      const { propertyId, page, limit } = action.meta.arg;
      state.reviewsByProperty[propertyId] = {
        loading: false,
        error: action.payload ?? 'Failed to load reviews',
        reviews: [],
        averageRating: 0,
        count: 0,
        page,
        limit,
      };
    });
    builder.addCase(upsertReview.pending, (state) => {
      state.upsertLoading = true;
      state.upsertError = null;
    });

    builder.addCase(upsertReview.fulfilled, (state, action) => {
      state.upsertLoading = false;
      const r = action.payload;
      const pid = r.propertyId;
      const bucket = state.reviewsByProperty[pid];
      if (bucket) {
        const idx = bucket.reviews.findIndex((rev) => rev.id === r.id);
        if (idx >= 0) {
          bucket.reviews[idx] = r;
        } else {
          bucket.reviews.unshift(r);
        }
      }
    });

    builder.addCase(upsertReview.rejected, (state, action) => {
      state.upsertLoading = false;
      state.upsertError = action.payload ?? 'Failed to save review';
    });
    builder.addCase(deleteReview.pending, (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
    });

    builder.addCase(deleteReview.fulfilled, (state, action) => {
      state.deleteLoading = false;
      const pid = action.payload.propertyId;
      delete state.reviewsByProperty[pid];
    });

    builder.addCase(deleteReview.rejected, (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload ?? 'Failed to delete review';
    });
  },
});

export const { clearReviewsForProperty } = reviewSlice.actions;
export default reviewSlice.reducer;
