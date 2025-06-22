import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useContext, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';
import FilterPanel, { PropertyFilters } from './FilterPanel';
import { motion } from 'framer-motion';
import UserLayout from '@/components/userLayout/Layout';
import { ThemeContext } from '@/components/context/ThemeContext';
import HeroSection from '@/components/hero/HeroSection';
import socket, { connectSocket } from '@/utils/socket';

const PropertiesListPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.properties);
  const { theme } = useContext(ThemeContext)!;
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [page, setPage] = useState(1);
  const limit = 10;
  const [cityTyping, setCityTyping] = useState('');

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
              <h2 className="text-2xl font-bold">
                No treasures found!
              </h2>
              <p className="mt-2 text-gray-500">
                Tweak your filters or explore a new city — your perfect spot is out there.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((prop, idx) => (
                <Link
                  key={prop.id}
                  href={`/properties/${prop.id}`}
                  className={`group block rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-800 shadow-gray-800/50 hover:shadow-gray-700/50'
                      : 'bg-white hover:shadow-2xl'
                  }`}
                >
                  <div className="relative h-60 w-full bg-gray-200">
                    {prop.images?.[0] ? (
                      <Image
                        src={prop.images[0].url}
                        alt={prop.images[0].fileName}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={idx === 0}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-1">{prop.title}</h2>
                    <p className="text-gray-500">{prop.city}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold">
                        Birr {prop.rentPerMonth}/mo
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {prop.propertyType}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{prop.numBedrooms} bd</span>
                      <span className="mx-2">·</span>
                      <span>{prop.numBathrooms} ba</span>
                    </div>
                  </div>
                </Link>
              ))}
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
