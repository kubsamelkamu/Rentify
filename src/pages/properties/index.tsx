import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useContext, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties, likeProperty, unlikeProperty } from '@/store/slices/propertySlice';
import { fetchPropertyReviews } from '@/store/slices/reviewSlice';
import FilterPanel, { PropertyFilters } from './FilterPanel';
import { motion } from 'framer-motion';
import { Bed, Bath, Star, Heart } from 'lucide-react';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';
import HeroSection from '@/components/hero/HeroSection';
import socket, { connectSocket } from '@/utils/socket';

const PropertiesListPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.properties);
  const { reviewsByProperty } = useAppSelector((s) => s.reviews);
  const { theme } = useContext(ThemeContext)!;

  const [filters, setFilters] = useState<PropertyFilters>({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [cityTyping, setCityTyping] = useState('');

  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const userId = useAppSelector((s) => s.auth.user?.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, city: cityTyping || undefined }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [cityTyping]);

  const reload = useCallback(() => {
    dispatch(fetchProperties({ ...filters, page, limit }));
  }, [dispatch, filters, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (items.length) {
      items.forEach((prop) => {
        if (!reviewsByProperty[prop.id]) {
          dispatch(fetchPropertyReviews({ propertyId: prop.id, page: 1, limit: 1 }));
        }
      });
    }
  }, [dispatch, items, reviewsByProperty]);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    connectSocket(token);

    socket.on('listing:approved', reload);
    socket.on('listing:pending', reload);

    return () => {
      socket.off('listing:approved', reload);
      socket.off('listing:pending', reload);
    };
  }, [reload]);

  const hasNextPage = items.length === limit;

  const toggleLike = (propId: string, liked: boolean) => {
    if (!userId) {
      alert('You must be logged in to like properties.');
      return;
    }
    if (likingIds.has(propId)) return; 

    setLikingIds((prev) => new Set(prev).add(propId));

    const action = liked ? unlikeProperty(propId) : likeProperty(propId);
    dispatch(action).finally(() => {
      setLikingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(propId);
        return copy;
      });
    });
  };

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Properties</title>
        <meta
          name="description"
          content="Browse our latest property listings—filter by city, type, and price to find your dream home on Rentify."
        />
      </Head>

      <div
        className={`min-h-screen px-6 ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
        }`}
      >
        <HeroSection />

        <div className="pt-12 max-w-7xl mx-auto space-y-8">
          <FilterPanel
            initial={filters}
            onCityChange={setCityTyping}
            onApply={(f) => {
              setFilters(f);
              setPage(1);
            }}
            onReset={() => {
              setFilters({});
              setCityTyping('');
              setPage(1);
            }}
          />

          {loading ? (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(limit)].map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse h-80 rounded-2xl shadow ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          ) : error ? (
            <p className={`text-center mt-12 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center mt-16"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="text-7xl mb-4"
              >
                🏡
              </motion.div>
              <h2 className="text-2xl font-bold">No treasures found!</h2>
              <p className="mt-2 text-gray-500">
                Tweak your filters or explore a new city — your perfect spot is out there.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((prop, idx) => {
                const bucket = reviewsByProperty[prop.id];
                const isLiking = likingIds.has(prop.id);

                return (
                  <div
                    key={prop.id}
                    className={`group block rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-800 shadow-gray-800/50 hover:shadow-gray-700/50'
                        : 'bg-white hover:shadow-2xl'
                    }`}
                  >
                    <Link
                      href={`/properties/${prop.id}`}
                      className="relative block h-60 w-full bg-gray-200"
                    >
                      {prop.images?.[0] ? (
                        <Image
                          src={prop.images[0].url}
                          alt={prop.images[0].fileName}
                          layout="fill"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={idx === 0}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}
                    </Link>
                    <div className="p-6">
                      {bucket?.loading ? (
                        <span className="text-sm text-gray-400">Loading reviews…</span>
                      ) : (
                        <div className="flex items-center text-sm text-yellow-500 mb-2">
                          <Star className="mr-1" size={14} />
                          <span>{bucket?.averageRating.toFixed(1)}</span>
                          <span className="ml-1 text-gray-600">({bucket?.count})</span>
                        </div>
                      )}

                      <h2 className="text-2xl font-semibold mb-1">{prop.title}</h2>
                      <p className="text-gray-500 mb-2">{prop.city}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold">{prop.rentPerMonth} Birr/month</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {prop.propertyType}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                        <div className="flex items-center">
                          <Bed className="mr-1" size={16} />
                          <span>{prop.numBedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="mr-1" size={16} />
                          <span>{prop.numBathrooms}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Link
                          href={`/properties/${prop.id}`}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => toggleLike(prop.id, prop.likedByUser ?? false)}
                          className="flex items-center space-x-1 disabled:opacity-50"
                          disabled={isLiking || !userId}
                        >
                          <Heart
                            size={20}
                            className={`transition-colors ${
                              prop.likedByUser ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`}
                          />
                          <span className="text-sm">{prop.likesCount ?? 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center space-x-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-full shadow disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-medium">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="px-4 py-2 border rounded-full shadow disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PropertiesListPage;
