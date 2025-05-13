import { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';
import FilterPanel, { PropertyFilters } from './FilterPanel';
import { motion } from 'framer-motion'; 

const PropertiesListPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.properties);

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

  useEffect(() => {
    dispatch(fetchProperties({ ...filters, page, limit }));
  }, [dispatch, filters, page]);

  const hasNextPage = items.length === limit;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        <FilterPanel
          initial={filters}
          onCityChange={setCityTyping}
          onApply={(f) => { setFilters(f); setPage(1); }}
          onReset={() => { setFilters({}); setCityTyping(''); setPage(1); }}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse h-80 bg-white rounded-2xl shadow" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-600 text-center mt-12">{error}</p>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center mt-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-7xl mb-4"
            >
              🏡
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800">No treasures found!</h2>
            <p className="text-gray-500 mt-2">Tweak your filters or explore a new city — your perfect spot is out there.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((prop) => (
              <Link
                key={prop.id}
                href={`/properties/${prop.id}`}
                className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 duration-200"
              >
                <div className="relative h-60 w-full bg-gray-200">
                  {prop.images && prop.images.length > 0 ? (
                    <Image
                      src={prop.images[0].url}
                      alt={prop.images[0].fileName}
                      layout="fill"
                      objectFit="cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {prop.title}
                  </h2>
                  <p className="text-gray-500 mb-3">{prop.city}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      Birr {prop.rentPerMonth}/mo
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
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

        <div className="mt-10 flex justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border rounded-full shadow hover:bg-gray-100 disabled:opacity-50"
          >Prev</button>
          <span className="font-medium text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
            className="px-4 py-2 bg-white border rounded-full shadow hover:bg-gray-100 disabled:opacity-50"
          >Next</button>
        </div>

      </div>
    </div>
  );
};

export default PropertiesListPage;
