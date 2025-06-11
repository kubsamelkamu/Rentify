import Head from 'next/head';
import Link from 'next/link';

export default function VerifyEmailInfoPage() {
  return (
    <>
    <Head>
      <title> Rentify | Verify Email</title>
      <meta name="description" content="Reset your Rentify account password." />
    </Head>
    <div className="flex items-center justify-center h-screen p-4 bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          we&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
    </>
    
  );
}
