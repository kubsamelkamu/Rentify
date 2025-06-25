'use client';
import { useContext, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {Building,Users,Star,ArrowRight,MapPin,} from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchMetrics } from '@/store/slices/adminSlice';

type Theme = 'light' | 'dark';

interface StatCardProps {
  theme: Theme;
  icon: React.ReactNode;
  value: number;
  label: string;
  description?: string;
}

interface PropertyCardProps {
  theme: Theme;
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  featured?: boolean;
}

export default function HomePage() {
  const { theme } = useContext(ThemeContext)! as { theme: Theme };
  const dispatch = useAppDispatch();

  const { items: recentProperties, loading } = useAppSelector((s) => s.properties);
  const { metrics } = useAppSelector((s) => s.admin)!;

  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 3 }));
    dispatch(fetchMetrics());
  }, [dispatch]);

  const stats: Omit<StatCardProps, 'theme'>[] = [
    {
      icon: <Building className="w-6 h-6" />,
      value: metrics?.totalProperties || 0,
      label: 'Properties Listed',
      description: 'Verified listings across Ethiopia',
    },
    {
      icon: <Users className="w-6 h-6" />,
      value: metrics?.totalUsers || 0,
      label: 'Happy Users',
      description: 'Satisfied customers and growing',
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: Number(metrics?.totalReviews?.toFixed(1)) || 0,
      label: 'Average Rating',
      description: 'Based on verified reviews',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      value: 10, 
      label: 'Cities Covered',
      description: 'From Addis Ababa to regional cities',
    },
  ];

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Your Next Home, Simplified</title>
        <meta
          name="description"
          content="Rentify is Ethiopia's premier digital rental marketplace. Search, apply, and sign for your next home, all in one place."
        />
        <link rel="canonical" href="/" />
      </Head>

      <div className={`transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
        <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
          theme === 'light'
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900'
            : 'bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900'
        }`}>
          <div className="relative z-10 max-w-3xl text-center px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your Next Home,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  Simplified
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-200 mb-8">
                Discover, apply, and secure your perfect rental property in Ethiopia with our comprehensive digital platform.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Explore Listings
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
        <section className={`py-20 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Featured Properties
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Here are the 3 most recently listed homes.
              </p>
            </motion.div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    theme={theme}
                    id={p.id}
                    image={p.images?.[0]?.url || '/placeholder.jpg'}
                    title={p.title}
                    location={p.city}
                    price={`ETB ${p.rentPerMonth}/month`}
                    beds={p.numBedrooms}
                    baths={p.numBathrooms}
                    featured={false}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
        <section className={`py-20 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <StatCard key={i} theme={theme} {...s} />
            ))}
          </div>
        </section>
        <section className="py-16 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto text-center">
            <h2 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
              Join the Rental Revolution
            </h2>
            <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              Whether you’re listing a property or searching for your next home,&nbsp;
              Rentify makes the process simple, secure, and satisfying.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-auto">
                <Link
                  href="/auth/register"
                  className={`block text-center px-8 py-3 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-700 text-gray-100 hover:bg-indigo-600'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-auto">
                <Link
                  href="/properties"
                  className={`block text-center border-2 px-8 py-3 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                      : 'border-indigo-400 text-indigo-300 hover:bg-gray-800'
                  }`}
                >
                  Browse Listings
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </UserLayout>
  );
}

// StatCard
const StatCard = ({ theme, icon, value, label, description }: StatCardProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`text-center p-6 rounded-xl ${
        theme === 'light' ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700 hover:bg-gray-600'
      } transition-all duration-300`}
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
        theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-900 text-indigo-400'
      }`}>
        {icon}
      </div>
      <div className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
        {inView ? <CountUp end={value} duration={2} separator="," /> : '0'}
        {label.includes('Rating') ? '' : '+'}
      </div>
      <div className={`text-lg font-semibold mb-2 ${
        theme === 'light' ? 'text-gray-700' : 'text-gray-200'
      }`}>
        {label}
      </div>
      {description && (
        <div className={`text-sm ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {description}
        </div>
      )}
    </motion.div>
  );
};

// PropertyCard
const PropertyCard = ({
  theme,
  id,
  image,
  title,
  location,
  price,
  beds,
  baths,
  featured,
}: PropertyCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`rounded-xl overflow-hidden ${
      theme === 'light' ? 'bg-white shadow-lg hover:shadow-xl' : 'bg-gray-800 hover:bg-gray-700'
    } transition-all duration-300 transform hover:-translate-y-2`}
  >
    <div className="relative">
      <Image
        src={image}
        alt={title}
        width={400}
        height={192}
        className="object-cover w-full h-48"
      />
      {featured && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Featured
        </div>
      )}
    </div>
    <div className="p-6">
      <h3 className={`text-xl font-semibold mb-2 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`}>
        {title}
      </h3>
      <div className="flex items-center text-gray-500 mb-3">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">{location}</span>
      </div>
      <div className={`text-2xl font-bold mb-4 ${
        theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
      }`}>
        {price}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{beds} beds</span>
        <span>{baths} baths</span>
      </div>
      <Link
        href={`/properties/${id}`}
        className={`inline-block w-full text-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 mt-2 ${
          theme === 'light' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-700 text-white hover:bg-indigo-600'
        }`}
      >
        View Detail
      </Link>
    </div>
  </motion.div>
);
