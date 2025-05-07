import { useState, FormEvent } from 'react';
import { registerUser } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { User, Mail, Lock } from 'lucide-react';

const RegisterPage = () => {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error: apiError } = useAppSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const result = await dispatch(
        registerUser({ name, email, password })
      );
      if (registerUser.fulfilled.match(result)) {
        router.push('/auth/login');
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred. Please try again.');
    }
  };

  const getApiErrorMessage = () => {
    if (!apiError) return null;
    if (apiError.includes('400')) {
      return 'Registration failed: Email already exist.';
    }
    return apiError;
  };

  return (
    <>
      <Head>
        <title>Register | Rentify</title>
        <meta name="description" content="Create an account on Rentify to find or list properties." />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/register-bg.jpg"
            alt="Register background"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl font-extrabold ml-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">Rentify</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User className="mr-2 text-indigo-500" size={18} /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 block h-7 w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Mail className="mr-2 text-indigo-500" size={18} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block h-7 w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="email@example.com"
                  required
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
                  className="mt-2 block h-7 w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="********"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="mr-2 text-indigo-500" size={18} /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 block h-7 w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="********"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                  placeholder='I agree to the Terms & Conditions'
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="/terms" className="font-medium text-purple-600 underline">Terms & Conditions</a>
                </label>
              </div>

              {formError ? (
                <p className="text-red-500 text-sm">{formError}</p>
              ) : (
                getApiErrorMessage() && <p className="text-red-500 text-sm">{getApiErrorMessage()}</p>
              )}

              <button
                type="submit"
                disabled={!agree || loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Registering…' : 'Create Account'}
              </button>
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <a
                  href="/auth/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login 
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
