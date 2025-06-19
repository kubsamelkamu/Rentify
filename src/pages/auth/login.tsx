import { useState, FormEvent, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error: apiError } = useAppSelector((state) => state.auth);
  const { redirect } = router.query as { redirect?: string };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      const destination = redirect
        ? decodeURIComponent(redirect)
        : '/properties';

      router.push(destination);
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError('Login failed. Please try again.');
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
              <p className="text-red-500 text-sm mb-4 text-center">{formError || apiError}</p>
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
                  placeholder=" you@example.com"
                 className="mt-2 block w-full px-3 py-2 border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
                />
              </div>
              <div> {/* Outer container for the whole field */}
  <label className="flex items-center text-sm font-medium text-gray-700">
    <Lock className="mr-2 text-indigo-500" size={18} /> Password
  </label>
  
  {/* This new div is the key to the solution */}
  <div className="relative mt-2">
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      placeholder=" ********"
      // Note: mt-2 has been removed from here
      className="block w-full pl-3 pr-10 py-2 border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 text-black"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      // These classes now work correctly because the parent is the right height
      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
      aria-label="Toggle password visibility"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
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
                <Link href="/auth/reset-password" className="text-purple-600 hover:underline font-medium">
                  Forgot your password?
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
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
