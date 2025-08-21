import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyOtp, resendOtp, setAuth } from '@/store/slices/authSlice';


export default function VerifyOtpPage() {

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { email: queryEmail } = router.query as { email?: string };
  const emailFromStore = useAppSelector((state) => state.auth.email);
  const email = queryEmail || emailFromStore || '';
  const authState = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) {
      router.replace('/auth/login');
    }
  }, [email, router]);

  useEffect(() => {
    if (authState.user && authState.token) {
      router.replace('/properties');
    }
  }, [authState.user, authState.token, router]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const focusNextInput = (index: number) => {
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const focusPrevInput = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleInputChange = (value: string, index: number) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) focusNextInput(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '') {
      focusPrevInput(index);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPrevInput(index);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextInput(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (!/^[0-9]*$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resultAction = await dispatch(verifyOtp({ email, otp: otpString }));
      
      if (verifyOtp.fulfilled.match(resultAction)) {
        // Check if we have user data in the response
        if (resultAction.payload.user && resultAction.payload.token) {
          // Update auth state with the received data
          dispatch(setAuth({
            user: resultAction.payload.user,
            token: resultAction.payload.token
          }));
          router.replace('/properties');
        } else {
          try {
            router.push({
              pathname: '/auth/login',
              query: { message: 'Account verified. Please log in again.' }
            });
          } catch{
            setError('Verification successful but automatic login failed. Please log in manually.');
          }
        }
      } else {
        setError(resultAction.payload || 'OTP verification failed');
      }
    } catch  {
      setError('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');

    try {
      await dispatch(resendOtp(email)).unwrap();
      setResendCountdown(30);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch  {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verify OTP | Rentify</title>
        <meta name="description" content="Verify your OTP to access your Rentify account" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-indigo-700">Rentify</h1>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Verification Code</h2>
          <p className="text-center mb-6 text-gray-600">
            Enter the 6-digit code sent to <strong className="text-indigo-600">{email}</strong>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between space-x-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || resendLoading}
                className={`font-medium ${resendCountdown > 0 ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-500'}`}
              >
                {resendLoading
                  ? 'Sending...'
                  : `Resend ${resendCountdown > 0 ? `(${resendCountdown}s)` : ''}`}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}