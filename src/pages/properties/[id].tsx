import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropertyById, deleteProperty } from '@/store/slices/propertySlice';
import { requestBooking } from '@/store/slices/bookingSlice';
import Link from 'next/link';
import toast from 'react-hot-toast';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion } from 'framer-motion';

const PropertyDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { current, loading, error } = useAppSelector(s => s.properties);
  const { loading: bookingLoading } = useAppSelector(s => s.bookings);
  const authUser = useAppSelector(s => s.auth.user);
  const { theme } = useContext(ThemeContext)!;

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchPropertyById(id));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!current?.id) return;
    const promise = dispatch(deleteProperty(current.id)).unwrap();
    toast.promise(promise, {
      loading: 'Deleting property…',
      success: 'Deleted!',
      error: 'Delete failed.',
    });
    try {
      await promise;
      router.push('/properties');
    } catch {
      // no-op
    }
  };

  const isLoggedIn = !!authUser;
  const isTenant = authUser?.role === 'TENANT';
  const isPropLandlord = authUser?.role === 'LANDLORD' && authUser.id === current?.landlord?.id;

  const handleBookingRequest = () => {
    if (!startDate || !endDate) {
      return toast.error('Please select both start and end dates.');
    }
    if (!current?.id) return;
    const promise = dispatch(
      requestBooking({ propertyId: current.id, startDate, endDate })
    ).unwrap();

    toast.promise(promise, {
      loading: 'Requesting booking…',
      success: 'Booking request sent!',
      error: (errMsg) => `Request failed: ${errMsg}`,
    });


    promise.then(() => {
      setStartDate('');
      setEndDate('');
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <UserLayout>
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>        
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-500'}`} />
          </div>
        )}
        {error && (
          <p className={`text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>{error}</p>
        )}
        {!loading && current && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Detail */}
            <div className={`col-span-2 rounded-2xl shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800 shadow-gray-800/50' : 'bg-white'}`}>
              {/* image grid and property info unchanged */}
              {current.images?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {current.images.slice(0, 2).map(img => (
                    <div key={img.id} className="relative h-64 w-full">
                      <Image src={img.url} alt={img.fileName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`h-64 w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                  No Images Available
                </div>
              )}
              <div className="p-8 relative">
                {isPropLandlord && (
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <button
                      onClick={() => router.push(`/properties/${current.id}/edit`)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <h1 className="text-4xl font-bold mb-2">{current.title}</h1>
                <p className="mb-4">{current.city}</p>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-2xl font-extrabold">${current.rentPerMonth}/mo</span>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {current.propertyType}
                  </span>
                </div>
                <p className="prose mb-6">{current.description}</p>
                <div className="mt-6 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-2">Owner Information</h2>
                  <p><span className="font-medium">Name:</span> {current.landlord?.name || '—'}</p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {current.landlord?.email
                      ? <a href={`mailto:${current.landlord.email}`} className="text-blue-600 hover:underline">
                          {current.landlord.email}
                        </a>
                      : '—'}
                  </p>
                </div>
              </div>
            </div>


            <div className={`rounded-2xl shadow-lg p-6 space-y-4 ${theme === 'dark' ? 'bg-gray-800 shadow-gray-800/50' : 'bg-white'}`}>
              {!isLoggedIn && (
                <button
                  onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-full"
                >
                  Login to Book
                </button>
              )}
              {isTenant && !isPropLandlord && (
                <>
                  <h2 className="text-2xl font-semibold">Request to Book</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        min={today}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate || today}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      />
                    </div>
                    <motion.button
                      onClick={handleBookingRequest}
                      disabled={bookingLoading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50"
                    >
                      {bookingLoading ? 'Sending...' : 'Send Booking Request'}
                    </motion.button>
                  </div>
                </>
              )}
              {isPropLandlord && (
                <Link href={`/properties/${current.id}/bookings`} passHref className="w-full block text-center px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
                    See Booking Requests
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Original CTA Buttons */}
        {!loading && current && (
          <div className="mt-8 max-w-4xl mx-auto flex justify-center">
            {isPropLandlord ? (
              <Link href={`/properties/${current.id}/chat`} passHref>
                <motion.a
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                >
                  Chat with Tenant
                </motion.a>
              </Link>
            ) : (
              <Link
                href={
                  authUser
                    ? `/properties/${current.id}/chat`
                    : `/login?redirect=${encodeURIComponent(`/properties/${current.id}`)}`
                }
                passHref
              >
                <motion.a
                  initial={{ scale: 1.5 }}
                  animate={{ scale: [2,3,2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 3, boxShadow: '0px 0px 16px rgba(59, 130, 246, 0.9)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full"
                >
                  Chat with Owner
                </motion.a>
              </Link>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default PropertyDetailPage;
