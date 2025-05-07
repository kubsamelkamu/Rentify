import { useState, FormEvent } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      router.push('/');
    } catch(err:any) {
      setFormError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Login | Rentify</title>
        <meta name="description" content="Login to your Rentify account to manage your rentals." />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">

        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/login_bg.jpg"
            alt="Login background"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-center mb-6">

              <h1 className="text-4xl font-extrabold ml-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                Rentify
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              Welcome back!
            </h2>
            {formError ? (
              <p className="text-red-500 text-sm mb-4 text-center">{formError}</p>
            ) : (
              error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="mr-2 text-indigo-500" size={18} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="mr-2 text-indigo-500" size={18} /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                <Link href="/auth/reset-password" className="text-purple-600 hover:underline">
                Forgot your password?
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
