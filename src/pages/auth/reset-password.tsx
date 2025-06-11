import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPassword, clearError } from '@/store/slices/authSlice';

export default function ResetPasswordPage() {

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = router.query as { token?: string };
  const { loading, error } = useAppSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || !confirmPassword) {
      setFormError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!token) {
      setFormError('Invalid or missing token.');
      return;
    }

    try {
      await dispatch(resetPassword({ token, newPassword })).unwrap();
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch{
      setFormError( 'Reset failed.');
    }
  };


  return (
    <>
      <Head>
        <title>Rentify | Reset Password</title>
        <meta name="description" content="Set a new password for your Rentify account." />
      </Head>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/forgot_bg.jpg"
            alt="Reset password background"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Reset Password
            </h1>
            {success ? (
              <div className="text-center">
                <CheckCircle size={48} className="text-green-600 mx-auto" />
                <p className="mt-4 text-lg font-medium text-green-600">Password reset successful!</p>
                <p className="mt-2 text-gray-600">Redirecting to login...</p>
              </div>
            ) : (
              <>
                {formError && (
                  <p className="text-sm text-red-600 text-center mb-4">{formError}</p>
                )}
                {error && (
                  <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Lock className="mr-2 text-indigo-500" size={18} /> New Password
                    </label>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((p) => !p)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      aria-label="Toggle password visibility"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Lock className="mr-2 text-indigo-500" size={18} /> Confirm Password
                    </label>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="mt-2 block w-full border-gray-200 rounded-lg shadow-sm pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-600 disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" size={18} /> Resetting…
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
