import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';

export default function VerifyPage() {
    
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (!token) return;
    async function verify() {
      try {
        const res = await api.get(`/api/auth/verify?token=${token}`);
        const data = res.data;
        if (res) {
          setStatus('Your email has been verified successfully! Redirecting to login...');
          setTimeout(() => router.push('/auth/login'), 3000);
        } else {
          setStatus(data.error || 'Verification failed.');
        }
      } catch{
        setStatus('An error occurred during verification.');
      }
    }
    verify();
  }, [token, router]);

  return (
    <>
      <Head>
        <title>Verify Email | Rentify</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
          <p>{status}</p>
        </div>
      </div>
    </>
  );
}