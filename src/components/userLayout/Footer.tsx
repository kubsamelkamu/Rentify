import React, { useContext } from 'react';
import Link from 'next/link';
import { ThemeContext } from '@/components/context/ThemeContext';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { motion } from 'framer-motion';
import NewsletterSignup from '../hero/Newsletter';

export default function Footer() {

  const { theme, toggleTheme } = useContext(ThemeContext)!;
  const { user } = useAppSelector((state) => state.auth);

  const bookingsLink = !user
    ? '/auth/login?redirect=/bookings'
    : user.role === 'TENANT'
    ? '/bookings'
    : '/landlord/bookings';

  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`border-t transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/">
            <span
              className={`text-2xl font-bold cursor-pointer transition-colors ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Rentify
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            Your trusted platform for finding and listing rental properties. We connect landlords and tenants seamlessly
            for a smooth rental experience.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {['about', 'properties', 'bookings','contact', 'terms&conditions'].map((key) => {
              const linkHref = key === 'bookings' ? bookingsLink : `/${key}`;
              return (
                <li key={key}>
                  <Link
                    href={linkHref}
                    className={`transition-colors duration-200 hover:${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.replace('&', ' & ').slice(1)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Need Help?</h4>
          <p className="text-sm mb-2">
            Email:{' '}
            <a
              href="mailto:srentify@gmail.com"
              className={`transition-colors duration-200 hover:${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              support@rentify.et
            </a>
          </p>
        </div>

        <div>
          <NewsletterSignup />
        </div>
      </div>

      <div
        className={`border-t py-4 text-center flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <span className="text-sm">© {new Date().getFullYear()} Rentify. All rights reserved.</span>
        <button
          onClick={toggleTheme}
          className={`mt-1 md:mt-0 inline-flex items-center px-3 py-1 border rounded-full text-sm transition-all ${
            theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="mr-2"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </motion.div>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </motion.footer>
  );
}
