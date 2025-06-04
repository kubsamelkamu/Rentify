import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import {LayoutDashboard,Users,Home,CalendarCheck,Star,BarChart,} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;        
}

const navLinks: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/metrics', label: 'Metrics', icon: BarChart },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64
          bg-blue-600 dark:bg-blue-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 
        `}
      >
        <div className="p-6 text-lg font-bold text-white dark:text-white">
          Rentify Admin
        </div>
        <nav className="mt-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = router.pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`
                    flex items-center px-6 py-3 cursor-pointer
                    text-white dark:text-gray-300
                    hover:bg-blue-700 dark:hover:bg-gray-700
                    rounded-lg
                    ${isActive ? 'bg-blue-800 dark:bg-gray-700 font-semibold' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={`
          fixed inset-0 bg-black bg-opacity-20 z-20 transition-opacity duration-200
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          md:hidden
        `}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
