import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/api';

export interface PropertyImage {
  id: string;
  url: string;
  fileName: string;
  publicId?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  city: string;
  rentPerMonth: string;
  numBedrooms: number;
  numBathrooms: number;
  propertyType: string;
  amenities: string[];
  landlord?: { id: string; name: string; email: string };
  images?: PropertyImage[];
  createdAt: string;
}

export interface FetchPropertiesParams {
  page?: number;
  limit?: number;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: string;
  amenities?: string[];
}

interface PropertyState {
  items: Property[];
  current?: Property;
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  items: [],
  current: undefined,
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk<
  Property[],
  FetchPropertiesParams,
  { rejectValue: string }
>(
  'properties/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.city) query.append('city', params.city);
      if (params.minPrice) query.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
      if (params.minBedrooms) query.append('minBedrooms', params.minBedrooms.toString());
      if (params.maxBedrooms) query.append('maxBedrooms', params.maxBedrooms.toString());
      if (params.propertyType) query.append('propertyType', params.propertyType);
      if (params.amenities) {
        query.append('amenities', params.amenities.join(','));
      }

      const response = await api.get(`/api/properties?${query.toString()}`);
      return response.data.data as Property[];
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.error || err.message);
      }
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue('An unknown error occurred while fetching properties.');
    }
  }
);


export const fetchPropertyById = createAsyncThunk<
  Property,
  string,
  { rejectValue: string }
>('properties/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/properties/${id}`);
    return response.data as Property;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('An unknown error occurred while fetching property.');
  }
});

export const createProperty = createAsyncThunk<
  Property,
  Omit<Property, 'id' | 'landlord' | 'images' | 'createdAt'>,
  { rejectValue: string }
>('properties/create', async (newData, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/properties', newData);
    return response.data as Property;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('An unknown error occurred while creating property.');
  }
});

export const updateProperty = createAsyncThunk<
  Property,
  { id: string; data: Partial<Omit<Property, 'id' | 'landlord' | 'images'>> },
  { rejectValue: string }
>('properties/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/api/properties/${id}`, data);
    return response.data as Property;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('An unknown error occurred while updating property.');
  }
});

export const deleteProperty = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('properties/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/properties/${id}`);
    return id;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('An unknown error occurred while deleting property.');
  }
});

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch properties';
      })
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<Property>) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch property';
      })
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create property';
      })
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.loading = false;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update property';
      })
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.current?.id === action.payload) state.current = undefined;
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to delete property';
      });
  },
});

export default propertySlice.reducer;