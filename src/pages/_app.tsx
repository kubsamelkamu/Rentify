import "@/styles/globals.css";
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '@/store/store';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/context/ThemeContext';
import { connectSocket } from '@/utils/socket';

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
        <SocketConnector />
        
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Provider>
    </ThemeProvider>
  );
}

