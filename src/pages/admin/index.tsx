import { NextPage } from 'next';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMetrics } from '@/store/slices/adminSlice';
import AdminLayout from '@/components/admin/AdminLayout';
import socket, { connectSocket } from '@/utils/socket';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {Users as UsersIcon,Home as HomeIcon,CalendarCheck as BookingsIcon,Star as ReviewsIcon,Currency as RevenueIcon,
} from 'lucide-react';

const AdminDashboardPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth)!;
  const { metrics, loading, error } = useAppSelector((s) => s.admin)!;

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    dispatch(fetchMetrics());
    const token = localStorage.getItem('token') || '';
    connectSocket(token);

    const refresh = () => dispatch(fetchMetrics());

    socket.on('admin:newUser', refresh);
    socket.on('admin:updateUser', refresh);
    socket.on('admin:deleteUser', refresh);

    socket.on('admin:newProperty', refresh);
    socket.on('admin:updateProperty', refresh);
    socket.on('admin:deleteProperty', refresh);

    socket.on('newBooking', refresh);
    socket.on('bookingStatusUpdate', refresh);
    socket.on('paymentStatusUpdated', refresh);

    socket.on('admin:newReview', refresh);
    socket.on('admin:updateReview', refresh);
    socket.on('admin:deleteReview', refresh);

    socket.on('listing:approved', refresh);
    socket.on('listing:rejected', refresh);
    socket.on('listing:pending', refresh);

    return () => {
      socket.off('admin:newUser', refresh);
      socket.off('admin:updateUser', refresh);
      socket.off('admin:deleteUser', refresh);

      socket.off('admin:newProperty', refresh);
      socket.off('admin:updateProperty', refresh);
      socket.off('admin:deleteProperty', refresh);

      socket.off('newBooking', refresh);
      socket.off('bookingStatusUpdate', refresh);
      socket.off('paymentStatusUpdated', refresh);

      socket.off('admin:newReview', refresh);
      socket.off('admin:updateReview', refresh);
      socket.off('admin:deleteReview', refresh);

      socket.off('listing:approved', refresh);
      socket.on('listing:rejected', refresh);
      socket.on('listing:pending', refresh);
    };
  }, [dispatch, user]);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Dashboard</title>
        <meta name="description" content="Admin dashboard overview" />
      </Head>

      <div className="space-y-6">
        <div className="bg-blue-600 p-6 rounded-lg text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.name} 👋</h1>
            <p className="mt-1">Today is {today}</p>
          </div>
          <h2 className="text-lg font-semibold">Overview</h2>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {!loading && metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              { label: 'Total Users',    value: metrics.totalUsers,     icon: UsersIcon },
              { label: 'Properties',     value: metrics.totalProperties, icon: HomeIcon },
              { label: 'Bookings',       value: metrics.totalBookings,   icon: BookingsIcon },
              { label: 'Reviews',        value: metrics.totalReviews,    icon: ReviewsIcon },
              { label: 'Revenue (ETB)',  value: metrics.totalRevenue,    icon: RevenueIcon },
            ].map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-blue-600 p-6 rounded-lg text-white hover:shadow-xl cursor-pointer transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6" />
                  <h3 className="text-sm font-medium">{label}</h3>
                </div>
                <p className="mt-4 text-3xl font-extrabold">
                  {value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
