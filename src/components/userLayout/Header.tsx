import React, { useState, useContext, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { SunIcon, MoonIcon } from 'lucide-react';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href?: string;
  subItems?: SubItem[];
}

interface SubItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'About', href: '/about' },
  {
    label: 'Properties',
    subItems: [
      { label: 'List Property', href: '/properties/list' },
      { label: 'Rent Property', href: '/properties' },
    ],
  },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Messages', href: '/messages' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useContext(ThemeContext)!;

  const languages = ['EN', 'AM', 'OR'];
  const memoizedNavItems = useMemo(() => navItems, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className={`border-b transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-gray-900 border-gray-700 text-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <div className="flex-shrink-0">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer">Rentify</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {memoizedNavItems.map((item) => (
            <div key={item.label} className="relative group">
              {item.subItems ? (
                <>
                  <button className="text-md font-medium hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                    {item.label}
                  </button>
                  <div className={`absolute left-0 mt-2 w-48 rounded-lg shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'}`}>
                    {item.subItems.map((sub) => (
                      <Link key={sub.label} href={sub.href} className={`block w-full text-left px-4 py-3 text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-gray-700 text-gray-100'}`}>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={item.href!} className="text-md font-medium hover:text-blue-600 dark:hover:text-blue-400">
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`mt-1 md:mt-0 inline-flex items-center px-3 py-1 border rounded-full text-sm transition ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 mr-2" /> Light Mode
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-2" /> Dark Mode
              </>
            )}
          </button>

          <div className="relative group">
            <button aria-label="Language selector" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {selectedLang}
            </button>
            <div className="absolute right-0 mt-2 w-28 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top">
              <div className={`${theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'} rounded-lg overflow-hidden`}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`block w-full text-left px-4 py-3 text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-gray-700 text-gray-100'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user ? (
            <div className="relative group">
              <Image
                className="h-8 w-8 rounded-full cursor-pointer ring-2 ring-blue-500"
                src="/avatar.jpg"
                alt={`${user.name}'s avatar`}
                width={32}
                height={32}
                priority
              />
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top">
                <div className={`${theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'} rounded-lg overflow-hidden`}>
                  <Link href="/profile" className={`block px-4 py-3 text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-gray-700 text-gray-100'}`}>
                    Your Profile
                  </Link>
                  <button onClick={() => dispatch(logout())} className={`block w-full text-left px-4 py-3 text-sm transition-colors ${theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-gray-700 text-gray-100'}`}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className={`mt-1 md:mt-0 inline-flex items-center px-3 py-1 border rounded-full text-sm transition ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}>
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 mr-2" /> Light Mode
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-2" /> Dark Mode
              </>
            )}
          </button>

          {user && (
            <Image
              className="h-8 w-8 rounded-full cursor-pointer ring-2 ring-blue-500"
              src="/avatar.jpg"
              alt="User avatar"
              width={32}
              height={32}
              priority
            />
          )}

          <button
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`md:hidden border-t ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-900 border-gray-700'}`} onKeyDown={handleKeyDown} role="menu">
            <div className="px-4 py-4 space-y-4">
              <div className="pb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Select Language</h3>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => setSelectedLang(lang)} className={`px-3 py-2 text-sm rounded-lg transition-colors ${selectedLang === lang ? 'bg-blue-600 text-white' : theme === 'light' ? 'bg-gray-50 hover:bg-gray-100 text-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-100'}`}>
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
   