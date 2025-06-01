import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from '@/store/store';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { connectSocket } from '@/utils/socket';
import { useEffect } from 'react';
import { setAuth } from '@/store/slices/authSlice';

function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        dispatch(setAuth({ token, user }));
      } catch (err) {
        console.error('AuthInitializer parse error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  return null;
}

function SocketConnector() {

  const token = useSelector((state: RootState) => state.auth.token);
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
  }, [token]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthInitializer />
        <SocketConnector />
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Provider>
    </ThemeProvider>
  );
}

