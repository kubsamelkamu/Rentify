import React, { useState, ReactNode, useContext } from 'react';
import Link from 'next/link';
import { ThemeContext } from '@/components/context/ThemeContext';
import { MoonIcon, SunIcon } from 'lucide-react';

interface FAQItemProps {
  question: string;
  children: ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {

  const [open, setOpen] = useState(false);
  const { theme } = useContext(ThemeContext)!;

  return (
    <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex justify-between items-center py-3 text-left focus:outline-none ${
          theme === 'dark'
            ? 'text-gray-200 hover:text-blue-400'
            : 'text-gray-800 hover:text-blue-600'
        }`}
        aria-expanded={open}
      >
        <span className="font-medium">{question}</span>
        <span className="ml-2 text-xl transform transition-transform duration-200">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className={`pb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Footer() {

  const themeContext = useContext(ThemeContext)!;
  const { theme, toggleTheme } = themeContext;

  return (
    <footer className={`border-t transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gray-900 border-gray-700 text-gray-300'
        : 'bg-gray-50 border-gray-200 text-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Link href="/">
            <span className={`text-2xl font-bold cursor-pointer ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Rentify
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            Your trusted platform for finding and listing rental properties. We connect landlords and tenants seamlessly, ensuring a smooth rental experience for everyone.
          </p>
        </div>
        <div className="md:col-span-1">
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {['about','properties', 'bookings', 'terms&conditions'].map(key => (
              <li key={key}>
                <Link
                  href={`/${key}`}
                  className={`hover:${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-1">
          <h4 className="text-lg font-semibold mb-4">Need Help?</h4>
          <p className="text-sm mb-2">
            Email:{' '}
            <a
              href="mailto:support@renthouse.com"
              className={`hover:${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              support@renthouse.com
            </a>
          </p>
        </div>

        <div className="md:col-span-1">
          <h4 className="text-lg font-semibold mb-4">FAQs</h4>
          <FAQItem question="How do I rent a property?">
            To rent, browse listings, select a property, and click “Rent Now.” You’ll be guided through booking dates and payment.
          </FAQItem>
          <FAQItem question="How do I list my property?">
            Click “List Property” in the menu, fill out the form with details and photos, and hit “List Property.” Your listing goes live instantly.
          </FAQItem>
          <FAQItem question="What payment methods are accepted?">
            We support Telebir and bank transfers. All payments are securely processed Via Chapa Payment gateway.
          </FAQItem>
          <FAQItem question="How can I chat with landlords?">
            Navigate properties Detail page,Click "chat with owner" button.
          </FAQItem>
          <FAQItem question="How can I contact support?">
            Reach out via email at support@renthouse.com.
          </FAQItem>

        </div>
      </div>

      <div className={`border-t py-4 text-center flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <span className="text-sm">
          © {new Date().getFullYear()} Rentify. All rights reserved.
        </span>
        <button
          onClick={toggleTheme}
          className={`mt-1 md:mt-0 inline-flex items-center px-3 py-1 border rounded-full text-sm transition ${
            theme === 'dark'
              ? 'border-gray-600 hover:bg-gray-800'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="w-5 h-5 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5 mr-2" />
              Dark Mode
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
