import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import {LayoutDashboard,Users,Home,CalendarCheck,Star,Settings,} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/landlord-requests', label: 'Landlord Requests', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
];

const settingsLink = { href: '/admin/settings', label: 'Settings', icon: Settings };

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {

  const [settingsOpen, setSettingsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsOpen]);

  return (
    <>
      <aside
        className={
          `
        fixed inset-y-0 left-0 z-30 w-64
        bg-blue-600 border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        flex flex-col
      `
        }
      >
        <div className="p-6 text-lg font-bold text-white">Rentify Admin</div>
        <nav className="mt-6 space-y-2">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} onClick={onClose}>
                <span className="flex items-center px-6 py-3 text-white hover:bg-blue-700 rounded-lg cursor-pointer">
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex-grow" />
        <div ref={settingsRef} className="relative mb-6">
          <div
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700 rounded-lg cursor-pointer"
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <settingsLink.icon className="w-5 h-5 mr-3" />
            <span>{settingsLink.label}</span>
          </div>

          {settingsOpen && (
            <div className="absolute left-full top-0 ml-2 bg-white text-gray-800 rounded-lg shadow-lg w-48">
              <Link href="/admin/profile" onClick={() => { onClose(); setSettingsOpen(false); }}>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Your Profile</div>
              </Link>
              <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </aside>
      <div
        className={
          `
        fixed inset-0 z-20 transition-opacity duration-200
        ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
        md:hidden
      `
        }
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
