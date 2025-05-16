import { store } from "@/store/store";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/context/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Provider>
    </ThemeProvider>
  );
}
