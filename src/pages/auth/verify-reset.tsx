import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyResetOtp, clearError } from '@/store/slices/authSlice';

export default function VerifyResetOtpPage() {

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const emailQuery = router.query.email as string | undefined;
  const [email] = useState(emailQuery || '');
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setMessage('');

    if (!email) {
      setFormError('Email missing. Please start again.');
      return;
    }
    if (!otp || otp.length !== 6) {
      setFormError('Enter the 6-digit OTP.');
      return;
    }

    try {
      await dispatch(verifyResetOtp({ email, otp })).unwrap();
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg =
        typeof err === 'string'
          ? err
          : err instanceof Error
          ? err.message
          : 'OTP verification failed.';
      setFormError(msg);
    }
  };

  return (
    <>
      <Head>
        <title>Rentify | Verify Reset OTP</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
            Verify OTP
          </h1>
          <p className="text-center text-gray-600 mb-4">
            {email ? (
              <>We sent a 6-digit code to <span className="font-medium">{email}</span>.</>
            ) : (
              <>We sent a 6-digit code to your email.</>
            )}
          </p>

          {formError && <p className="text-sm text-red-600 text-center mb-3">{formError}</p>}
          {error && <p className="text-sm text-red-600 text-center mb-3">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center mb-3">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <KeyRound className="mr-2 text-indigo-500" size={18} /> 6-digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500 tracking-widest text-center text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} /> Verifying…
                </span>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600">
              <Link className="text-purple-600 hover:underline" href="/auth/forgot-password">
                Use a different email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
