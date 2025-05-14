import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { SunIcon, MoonIcon } from 'lucide-react';
import { ThemeContext } from '@/components/context/ThemeContext';

const navItems = [
  {
    label: 'Properties',
    subItems: [
      { label: 'List Property', href: '/properties/create' },
      { label: 'Rent Property', href: '/properties/rent' },
    ],
  },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Messages', href: '/messages' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useContext(ThemeContext)!;
  const languages = ['EN', 'AM', 'OR'];

  return (
    <header
      className={`border-b transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-gray-100 border-gray-200 text-gray-800'
          : 'bg-gray-800 border-gray-600 text-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto mb-8 px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex-shrink-0 mt-5">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
              Rentify
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 mt-5">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <button className="text-md font-medium hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                {item.label}
              </button>

              {item.subItems && (
                <div
                  className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg border z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-white border-gray-200 text-gray-800'
                      : 'bg-gray-800 border-gray-700 text-gray-100'
                  }`}
                >
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-gray-100 text-gray-800'
                          : 'hover:bg-gray-700 text-gray-100'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4 mt-5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            {theme === 'dark' ? (
              <MoonIcon className="w-6 h-6" />
            ) : (
              <SunIcon className="w-6 h-6" />
            )}
          </button>

          <div className="relative group">
            <button className="p-2 rounded text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors duration-150">
              EN
            </button>
            <div
              className={`absolute right-0 mt-2 w-28 rounded-md shadow-lg border z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-white border-gray-200 text-gray-800'
                  : 'bg-gray-800 border-gray-700 text-gray-100'
              }`}
            >
              {languages.map((lang) => (
                <button
                  key={lang}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-800'
                      : 'hover:bg-gray-700 text-gray-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {user ? (
            <div className="relative group">
              <img
                className="h-8 w-8 rounded-full cursor-pointer"
                src="/avatar.jpg"
                alt="User avatar"
              />
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg border z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-white border-gray-200 text-gray-800'
                    : 'bg-gray-800 border-gray-700 text-gray-100'
                }`}
              >
                <Link
                  href="/profile"
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-800'
                      : 'hover:bg-gray-700 text-gray-100'
                  }`}
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    theme === 'light'
                      ? 'hover:bg-gray-100 text-gray-800'
                      : 'hover:bg-gray-700 text-gray-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-150"
            >
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-3xl text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
