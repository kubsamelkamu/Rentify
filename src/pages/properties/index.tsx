import { NextPage} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';

const PropertiesListPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.properties);
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    setFiltered(items);
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse bg-white h-64 rounded-2xl"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center mt-6">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-gray-600 mt-12">
          No properties found. 
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prop) => (
            <Link
              key={prop.id}
              href={`/properties/${prop.id}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition"
            >
              <div className="relative h-48 w-full bg-gray-200">
                {prop.images && prop.images.length > 0 ? (
                  <Image
                    src={prop.images[0].url}
                    alt={prop.images[0].fileName}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {prop.title}
                </h2>
                <p className="text-gray-500 truncate">{prop.city}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ${prop.rentPerMonth}/mo
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {prop.propertyType}
                  </span>
                </div>

                <div className="mt-3 flex space-x-2 text-sm text-gray-600">
                  <span>{prop.numBedrooms} Bed</span>
                  <span>·</span>
                  <span>{prop.numBathrooms} Bath</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesListPage;
