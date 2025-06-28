import { configureStore } from '@reduxjs/toolkit';
import adminReducer from '@/store/slices/adminSlice'
import authReducer from '@/store/slices/authSlice';
import propertyReducer from '@/store/slices/propertySlice';
import bookingReducer from '@/store/slices/bookingSlice'; 
import landlordRequestReducer from './slices/landlordRequestSlice'; 
import paymentReducer from '@/store/slices/paymentSlice';
import reviewReducer from './slices/reviewSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    properties: propertyReducer,
    bookings: bookingReducer,  
    payment: paymentReducer,
    reviews: reviewReducer, 
    landlordRequests: landlordRequestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
