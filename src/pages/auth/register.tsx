import { useState, FormEvent, useEffect, ChangeEvent, ElementType } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ElementType;
  type: 'text' | 'email' | 'password';
}

const InputField = ({ id, label, icon: Icon, type, ...props }: InputFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordType = type === 'password';

  const currentType = isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div>
      <label htmlFor={id} className="flex items-center text-sm font-medium text-gray-700">
        <Icon className="mr-2 text-indigo-500" size={18} /> {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={currentType}
          className={`block w-full border-gray-200 rounded-lg shadow-sm px-3 focus:border-purple-500 focus:ring-purple-500 text-black ${
            isPasswordType ? 'pr-10' : ''
          }`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            aria-label={`Toggle ${label.toLowerCase()} visibility`}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function RegisterPage() {
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {  error: apiError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    dispatch({ type: 'auth/clearError' });
  }, [dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const startTime = Date.now();
      const result = await dispatch(registerUser({ name, email, password }));
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 5000 - elapsed);
      await new Promise(resolve => setTimeout(resolve, remaining));
      
      if (registerUser.fulfilled.match(result)) {
        router.push('/auth/verify-email-info');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getApiErrorMessage = () => {
    if (!apiError) return null;
    if (apiError.includes('400')) return 'Registration failed: Email already exists.';
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
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Rentify
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="name"
                label="Full Name"
                icon={User}
                type="text"
                value={name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <InputField
                id="email"
                label="Email Address"
                icon={Mail}
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
              <InputField
                id="password"
                label="Password"
                icon={Lock}
                type="password"
                value={password}
                onChange={handleChange}
                placeholder="********"
                required
              />
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                icon={Lock}
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required
              />
              <div className="flex items-center">
                <input
                  id="agree-checkbox"
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="agree-checkbox" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms&conditions" className="font-medium text-purple-600 underline">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              {(formError || getApiErrorMessage()) && (
                <p className="text-red-500 text-sm">{formError || getApiErrorMessage()}</p>
              )}

              <button
                type="submit"
                disabled={!agree || isProcessing}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}