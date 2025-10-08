'use client';
import { FC } from 'react';
import { motion } from 'framer-motion';

const HeroSection: FC = () => {
  return (
    <section
      className="
        relative flex items-center justify-center
        w-full h-screen
        overflow-hidden
      "
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/7820358/pexels-photo-7820358.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/50" /> {/* Darker overlay for better text contrast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <h1
          className="
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
            font-extrabold
            text-white
            leading-tight
            mb-4
          "
        >
          Find Your Dream Home
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
        >
          Browse hundreds of verified rental listings across Addis Ababa and beyond —  
          all in one seamless, secure platform.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;