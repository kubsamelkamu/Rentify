import React from 'react';
import { useRouter } from 'next/router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Image from 'next/image';
import Link from 'next/link';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth)!;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  const avatarSrc = user?.profilePhoto ?? '/avatar.jpg';

  return (
    <header
      className="
        h-16 flex items-center justify-between
        px-4 md:px-6
        border-b border-blue-500
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-gray-100
      "
    >
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 className="flex-1 text-lg font-semibold text-blue-600 dark:text-blue-400 text-center md:text-left">
        Admin Dashboard
      </h1>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="relative group">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500 cursor-pointer">
              <Image
                src={avatarSrc}
                alt="Admin Avatar"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            <div
              className={`
                absolute right-0 mt-2 w-40 rounded-lg shadow-xl
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200
              `}
            >
              <Link href="/profile">
                <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Your Profile
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link
            href={`/auth/login`}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Topbar;
