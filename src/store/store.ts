import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import propertyReducer from '@/store/slices/propertySlice';
import bookingReducer from '@/store/slices/bookingSlice';  
import paymentReducer from '@/store/slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    bookings: bookingReducer,  
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
