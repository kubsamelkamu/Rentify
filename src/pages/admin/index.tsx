import { NextPage } from 'next';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMetrics } from '@/store/slices/adminSlice';
import AdminLayout from '@/components/admin/AdminLayout';
import socket, { connectSocket } from '@/utils/socket';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Home as HomeIcon,
  CalendarCheck as BookingsIcon,
  Star as ReviewsIcon,
  Currency as RevenueIcon,
  TrendingUp,
  Bell,
  Download,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  MessageSquare,
  UserPlus,
  Home,
  Calendar,
  LucideIcon
} from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
}

interface SystemStatus {
  service: string;
  status: string;
  icon: LucideIcon;
}

interface RecentActivity {
  id: number;
  action: string;
  user: string;
  time: string;
  type: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

const AdminDashboardPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { metrics, loading, error } = useAppSelector((s) => s.admin)!;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return;
    }
    
    dispatch(fetchMetrics());
    const token = localStorage.getItem('token') || '';
    connectSocket(token);

    const refresh = () => {
      dispatch(fetchMetrics());
      setRefreshing(true);
      refreshTimeoutRef.current = setTimeout(() => setRefreshing(false), 1000);
    };

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

    // Mock notifications data
    setNotifications([
      {
        id: 1,
        type: 'booking',
        message: 'New booking received from Tofik Ahmed',
        time: '20 min ago',
        read: false,
        icon: Calendar
      },
      {
        id: 2,
        type: 'user',
        message: 'New user registered - Alice Smith',
        time: '5 min ago',
        read: false,
        icon: UserPlus
      },
      {
        id: 3,
        type: 'property',
        message: 'New property pending approval',
        time: '10 min ago',
        read: true,
        icon: Home
      },
      {
        id: 4,
        type: 'review',
        message: 'New review submitted for Luxury Villa',
        time: '1 hour ago',
        read: true,
        icon: MessageSquare
      }
    ]);

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
      socket.off('listing:rejected', refresh);
      socket.off('listing:pending', refresh);

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [dispatch, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchMetrics());
    refreshTimeoutRef.current = setTimeout(() => setRefreshing(false), 1000);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const quickStats: QuickStat[] = [
    { label: 'Active Users', value: '20', change: '+12%', trend: 'up' },
    { label: 'Occupancy Rate', value: '48%', change: '+5%', trend: 'up' },
    { label: 'Avg. Rating', value: '4.8', change: '+0.2', trend: 'up' },
    { label: 'Response Time', value: '2.3h', change: '-0.5h', trend: 'down' },
  ];

  const recentActivities: RecentActivity[] = [
    { id: 1, action: 'New booking', user: 'Abdi Biya', time: '20 min ago', type: 'success' },
    { id: 2, action: 'User registration', user: 'Girum Kenenisa', time: 'one day ago', type: 'info' },
    { id: 3, action: 'Property listed', user: 'Bonsa Adem', time: '10 min ago', type: 'warning' },
    { id: 4, action: 'Payment received', user: 'Kera Zal', time: '1 hour ago', type: 'success' },
  ];

  const systemStatus: SystemStatus[] = [
    { service: 'API', status: 'operational', icon: CheckCircle2 },
    { service: 'Database', status: 'healthy', icon: CheckCircle2 },
    { service: 'Cache', status: 'synced', icon: Clock },
    { service: 'Payments', status: 'operational', icon: CheckCircle2 },
  ];

  const metricConfigs = [
    { 
      label: 'Total Users', 
      value: metrics?.totalUsers || 0, 
      icon: UsersIcon, 
      bgColor: 'bg-blue-100',
      hoverBgColor: 'group-hover:bg-blue-200',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    { 
      label: 'Properties', 
      value: metrics?.totalProperties || 0, 
      icon: HomeIcon, 
      bgColor: 'bg-green-100',
      hoverBgColor: 'group-hover:bg-green-200',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    { 
      label: 'Bookings', 
      value: metrics?.totalBookings || 0, 
      icon: BookingsIcon, 
      bgColor: 'bg-purple-100',
      hoverBgColor: 'group-hover:bg-purple-200',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    { 
      label: 'Reviews', 
      value: metrics?.totalReviews || 0, 
      icon: ReviewsIcon, 
      bgColor: 'bg-yellow-100',
      hoverBgColor: 'group-hover:bg-yellow-200',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    { 
      label: 'Revenue (ETB)', 
      value: metrics?.totalRevenue || 0, 
      icon: RevenueIcon, 
      bgColor: 'bg-indigo-100',
      hoverBgColor: 'group-hover:bg-indigo-200',
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Dashboard</title>
        <meta name="description" content="Admin dashboard overview" />
      </Head>

      <div className="space-y-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-2xl font-bold">Hello, {user?.name} 👋</h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className={`p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-blue-100">Today is {today} • Welcome to your admin dashboard</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button 
                          onClick={markAllNotificationsAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-blue-100">
                                <notification.icon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {!loading && metrics && (
          <>
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {metricConfigs.map(({ label, value, icon: Icon, hoverBgColor, textColor, iconBg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${iconBg} ${hoverBgColor} transition-colors`}>
                      <Icon className={`w-6 h-6 ${textColor}`} />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-2">{label}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                  </p>
                  
                  {/* Trend indicator */}
                  <div className="flex items-center mt-3">
                    <div className={`flex items-center text-sm ${
                      i % 2 === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        i % 2 === 0 ? '' : 'transform rotate-180'
                      }`} />
                      {i % 2 === 0 ? '+' : ''}{Math.floor(Math.random() * 20) + 1}%
                    </div>
                    <span className="text-xs text-gray-500 ml-2">from last week</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {quickStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        <div className={`flex items-center text-sm ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`w-3 h-3 mr-1 ${
                            stat.trend === 'down' ? 'transform rotate-180' : ''
                          }`} />
                          {stat.change}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  {systemStatus.map((system, index) => (
                    <motion.div
                      key={system.service}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <system.icon className={`w-4 h-4 ${
                          system.status === 'operational' ? 'text-green-600' :
                          system.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{system.service}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        system.status === 'operational' ? 'bg-green-100 text-green-800' :
                        system.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {system.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View All Activity
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`p-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    } group-hover:scale-110 transition-transform`}>
                      <Activity className={`w-4 h-4 ${
                        activity.type === 'success' ? 'text-green-600' :
                        activity.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">by {activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;