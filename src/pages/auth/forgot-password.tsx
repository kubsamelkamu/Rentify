import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword, clearError } from '@/store/slices/authSlice';

export default function ForgotPasswordPage() {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      await dispatch(forgotPassword(email)).unwrap();
      router.push(`/auth/verify-reset?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      let msg = 'An unexpected error occurred.';
      if (typeof err === 'string') {
        msg = err;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setFormError(msg);
    }
  };

  return (
    <>
      <Head>
        <title>Rentify | Forgot Password</title>
        <meta name="description" content="Reset your Rentify account password." />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative">
          <video
          autoPlay
          loop
          muted
          playsInline

          src="https://www.pexels.com/download/video/7768205/"
          poster="https://images.pexels.com/photos/3643925/pexels-photo-3643925.jpeg" // A relevant poster image
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="https://www.pexels.com/download/video/7768205/" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                Rentify
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter your email address and we&apos;ll send you a one-time password (OTP) to verify your identity.
            </p>
            {formError && <p className="text-red-500 text-sm mb-4 text-center">{formError}</p>}
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="mr-2 text-indigo-500" size={18} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Remembered your password?{' '}
                <Link href="/auth/login" className="text-purple-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don’t have an account?{' '}
                <Link href="/auth/register" className="text-purple-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
