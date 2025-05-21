import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPropertyById, deleteProperty } from '@/store/slices/propertySlice';
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
  const authUser = useAppSelector(s => s.auth.user);
  const { theme } = useContext(ThemeContext)!;

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

  const isLandlord = authUser?.id === current?.landlord?.id;

  return (
    <UserLayout>
      <div className={`min-h-screen p-6 ${theme==='dark'?'bg-gray-900 text-gray-100':'bg-gray-100 text-gray-900'}`}>
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-4 ${theme==='dark'?'border-blue-400':'border-blue-500'}`} />
          </div>
        )}
        {error && (
          <p className={`text-center ${theme==='dark'?'text-red-400':'text-red-500'}`}>{error}</p>
        )}
        {!loading && current && (
          <>
            {/* Property Card */}
            <div className={`max-w-4xl mx-auto rounded-2xl shadow-lg overflow-hidden ${theme==='dark'?'bg-gray-800 shadow-gray-800/50':'bg-white'}`}>
              {current.images?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {current.images.slice(0,2).map(img => (
                    <div key={img.id} className="relative h-64 w-full">
                      <Image src={img.url} alt={img.fileName} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`h-64 w-full flex items-center justify-center ${theme==='dark'?'bg-gray-700 text-gray-400':'bg-gray-200 text-gray-500'}`}>
                  No Images Available
                </div>
              )}
              <div className="p-8 relative">
                {isLandlord && (
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

            {/* Conditional CTA */}
            <div className="mt-8 max-w-4xl mx-auto flex justify-center">
              {isLandlord ? (
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
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default PropertyDetailPage;

