import { NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBookings,
  updateBookingStatus,
  Booking,
} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';
import socket, { connectSocket } from '@/utils/socket';

const PAGE_SIZE = 5;

const AdminBookingsPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const {
    bookings,
    bookingsPage,
    bookingsTotalPages,
    loading,
    error,
  } = useAppSelector((state) => state.admin)!;

  const [page, setPage] = useState(bookingsPage);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const reload = useCallback(() => {
    dispatch(fetchBookings({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setPage(bookingsPage);
  }, [bookingsPage]);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);
    socket.on('newBooking', reload);
    socket.on('bookingStatusUpdate', reload);
    socket.on('paymentStatusUpdated', reload);

    return () => {
      socket.off('newBooking', reload);
      socket.off('bookingStatusUpdate', reload);
      socket.off('paymentStatusUpdated', reload);
    };
  }, [reload]);

  const handleStatusUpdate = async (
    id: string,
    status: 'CONFIRMED' | 'REJECTED'
  ) => {
    setUpdatingIds((m) => ({ ...m, [id]: true }));
    try {
      await dispatch(updateBookingStatus({ bookingId: id, status })).unwrap();
      toast.success(`Booking ${status.toLowerCase()}`);
      reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Could not update status: ' + message);
    } finally {
      setUpdatingIds((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  };

  const prev = () => {
    if (page > 1) setPage(page - 1);
  };

  const next = () => {
    if (page < bookingsTotalPages) setPage(page + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Bookings</title>
        <meta name="description" content="Admin page to manage bookings." />
      </Head>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">Manage Bookings</h1>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && bookings.length === 0 && <p>No bookings found.</p>}

        {bookings.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white divide-y divide-gray-200">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Property</th>
                    <th className="px-4 py-2 text-left">Tenant</th>
                    <th className="px-4 py-2 text-left">Dates</th>
                    <th className="px-4 py-2 text-left">Booking Status</th>
                    <th className="px-4 py-2 text-left">Payment</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b: Booking) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3">{b.property.title}</td>
                      <td className="px-4 py-3">
                        {b.tenant.name}
                        <br />
                        <a
                          href={`mailto:${b.tenant.email}`}
                          className="text-blue-500 text-sm"
                        >
                          {b.tenant.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(b.startDate).toLocaleDateString()} –{' '}
                        {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            b.status === 'PENDING'
                              ? 'bg-yellow-200 text-yellow-800'
                              : b.status === 'CONFIRMED'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.payment ? (
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              b.payment.status === 'PENDING'
                                ? 'bg-yellow-200 text-yellow-800'
                                : b.payment.status === 'SUCCESS'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {b.payment.status}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.status === 'PENDING' ? (
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                              disabled={updatingIds[b.id]}
                              className={`px-3 py-1 rounded text-white font-medium ${
                                updatingIds[b.id]
                                  ? 'bg-gray-400'
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                              disabled={updatingIds[b.id]}
                              className={`px-3 py-1 rounded text-white font-medium ${
                                updatingIds[b.id]
                                  ? 'bg-gray-400'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex justify-between bg-blue-600 text-white px-4 py-2 rounded-b-lg">
              <button
                onClick={prev}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-blue-800 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {bookingsTotalPages}
              </span>
              <button
                onClick={next}
                disabled={page >= bookingsTotalPages}
                className="px-3 py-1 rounded bg-blue-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBookingsPage;
