import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const publicEndpoints = ['/auth/verify-otp', '/auth/resend-otp', '/auth/register', '/auth/login'];
  if (!publicEndpoints.some((url) => config.url?.includes(url)) && token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
