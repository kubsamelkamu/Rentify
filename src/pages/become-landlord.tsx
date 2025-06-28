import { NextPage } from 'next';
import { useEffect, useContext, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { applyForLandlord } from '@/store/slices/authSlice';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const BecomeLandlordPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loading = useAppSelector((s) => s.auth.loading);

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user || !token) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent('/become-landlord')}`
      );
    }
  }, [user, token, router]);

  useEffect(() => {
    if (user?.role === 'LANDLORD' || user?.role === 'ADMIN') {
      router.replace('/profile');
    }
  }, [user, router]);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files).slice(0, 5));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one document.');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('docs', file));

    try {
      await dispatch(applyForLandlord(formData)).unwrap();
      toast.success('🎉 Application submitted! Awaiting review.');
      router.replace('/profile');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit application';
      toast.error(message);
    }
  };

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Become Landlord</title>
        <meta
          name="description"
          content="Upload verification documents to become a landlord on Rentify."
        />
      </Head>
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div
          className={`max-w-3xl w-full rounded-2xl shadow-lg p-8 space-y-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h1 className="text-3xl font-bold">Become a Landlord</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            Before listing properties, please upload documents to verify your landlord status.
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Documents</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-600 file:text-white
                         hover:file:bg-blue-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can upload up to 5 images (ID, license, etc.). JPG/PNG only.
            </p>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative w-full h-24 rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`doc-${i}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg text-lg font-semibold shadow ${
              loading
                ? 'opacity-50 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-blue-700 text-white hover:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>

          <p className="text-xs text-gray-500">
            By submitting, you agree to our{' '}
            <Link href="/terms&conditions" className="underline hover:text-blue-600">
              Terms & Conditions
            </Link>.
          </p>
        </div>
      </div>
    </UserLayout>
  );
};

export default BecomeLandlordPage;
