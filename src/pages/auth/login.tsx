import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';

export default function LoginPage() {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error: apiError, user } = useAppSelector((state) => state.auth);
  const { redirect } = router.query as { redirect?: string };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    dispatch(clearError());
    
    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      router.push('/admin');
    }else {
      const destination = redirect ? decodeURIComponent(redirect) : '/properties';
      router.push(destination);
    }
  }, [user, redirect, router]);

  const getLoginErrorMessage = (error: string) => {
    if (error.includes('401') || error.includes('Unauthorized')) {
      return 'Invalid email or password. Please try again.';
    } else if (error.includes('400')) {
      return 'Account not verified. Please check your email.';
    } else if (error.includes('Network Error')) {
      return 'Network error. Please check your internet connection.';
    } else if (error.includes('500')) {
      return 'Server error. Please try again later.';
    } else {
      return 'Login failed. Please try again.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearError());
    
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsProcessing(true);
    
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err: unknown) {
      if (isMountedRef.current) {
        if (err instanceof Error) {
          setFormError(getLoginErrorMessage(err.message));
        } else {
          setFormError('login Failed. Please try again.');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
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
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Rentify
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Welcome back!</h2>

            {(formError || apiError) && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                {formError || (apiError && getLoginErrorMessage(apiError))}
              </div>
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
                  placeholder="you@example.com"
                  className="mt-2 block w-full px-3 py-2 border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="mr-2 text-indigo-500" size={18} /> Password
                </label>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="********"
                    className="block w-full pl-3 pr-10 py-2 border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
                    disabled={isProcessing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    aria-label="Toggle password visibility"
                    disabled={isProcessing}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-purple-600 hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-purple-600 hover:underline font-medium"
                >
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
