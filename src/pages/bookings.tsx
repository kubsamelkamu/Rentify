import { NextPage } from 'next';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import {fetchUserBookings,cancelBooking,Booking,updateBookingInStore,} from '@/store/slices/bookingSlice';
import { ThemeContext } from '@/components/context/ThemeContext';

const PAGE_SIZE = 5;

const TenantBookingsPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;
  const { user } = useAppSelector((s) => s.auth);
  const { items: bookings, loading, error } = useAppSelector((s) => s.bookings);

  useEffect(() => {
    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent('/bookings')}`
      );
    } else if (user.role !== 'TENANT') {
      router.replace('/');
    }
  }, [user, router]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const paginated = bookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (user?.role === 'TENANT') {
      dispatch(fetchUserBookings());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user?.id) return;
    const room = `user_${user.id}`;
    socket.emit('joinRoom', room);

    const handleNew = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(`New booking for "${b.property?.title}" created!`);
    };
    const handleUpdate = (b: Booking) => {
      dispatch(updateBookingInStore(b));
      toast.success(
        `Your booking for "${b.property?.title}" is now ${b.status}`
      );
    };

    socket.on('newBooking', handleNew);
    socket.on('bookingStatusUpdate', handleUpdate);

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('newBooking', handleNew);
      socket.off('bookingStatusUpdate', handleUpdate);
    };
  }, [dispatch, user?.id]);

  if (!user || user.role !== 'TENANT') return null;

  return (
    <UserLayout>
      <div
        className={`min-h-screen p-6 transition-colors ${
          theme === 'dark'
            ? 'bg-gray-900 text-gray-100'
            : 'bg-gray-50 text-gray-900'
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {loading && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Loading your bookings…
          </p>
        )}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && bookings.length === 0 && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            You haven’t made any bookings yet.
          </p>
        )}

        {!loading && paginated.length > 0 && (
          <div className="space-y-4">
            {paginated.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded shadow transition-colors ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}
                    >
                      {b.property?.title}{' '}
                      <span className="italic">({b.status})</span>
                    </p>
                    <p
                      className={
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }
                    >
                      {new Date(b.startDate).toLocaleDateString()} –{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        const promise = dispatch(cancelBooking(b.id)).unwrap();
                        toast.promise(promise, {
                          loading: 'Cancelling…',
                          success: 'Cancelled!',
                          error: 'Cancel failed',
                        });
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && bookings.length > PAGE_SIZE && (
          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Previous
            </button>
            <span
              className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
            >
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default TenantBookingsPage;
