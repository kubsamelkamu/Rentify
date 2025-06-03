import { FC, useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

const HeroSection: FC = () => {

  const { theme } = useContext(ThemeContext)!;
  return (
    <section
      className={`
        relative flex items-center justify-center
        w-full 
        h-64 sm:h-80 md:h-96 lg:h-[500px]
        overflow-hidden
        ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}
      `}
    >
      <div
        className={`
          absolute inset-0 
          ${theme === 'dark' 
            ? 'bg-[url(/hero.jpg)] bg-cover bg-center' 
            : 'bg-[url(/hero.jpg)] bg-cover bg-center'}
          after:absolute after:inset-0 after:bg-black/40
        `}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          Find Your Dream Home
        </h1>
        <p className={`text-base sm:text-lg md:text-xl mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Browse thousands of listings across Addis Ababa and beyond.
        </p>
        <Link href="/properties">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-6 py-3 rounded-full font-medium 
              ${theme === 'dark' 
                ? 'bg-blue-500 text-gray-900 hover:bg-blue-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}
              transition
            `}
          >
            Browse Listings
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
