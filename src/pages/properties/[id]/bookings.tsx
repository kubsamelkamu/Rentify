import { NextPage } from 'next';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import socket from '@/utils/socket';
import {fetchPropertyBookings,confirmBooking,rejectBooking,Booking,} from '@/store/slices/bookingSlice';
import { fetchPropertyById } from '@/store/slices/propertySlice';
import { ThemeContext } from '@/components/context/ThemeContext';

const PropertyBookingsPage: NextPage = () => {

  const router = useRouter();
  const { id: propertyId } = router.query;
  const dispatch = useAppDispatch();
  const { theme } = useContext(ThemeContext)!;

  const property = useAppSelector((state) => state.properties.current);
  const propLoading = useAppSelector((state) => state.properties.loading);
  const propError = useAppSelector((state) => state.properties.error);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (typeof propertyId === 'string') {
      dispatch(fetchPropertyById(propertyId));
    }
  }, [dispatch, propertyId]);

  useEffect(() => {
    const loadBookings = async () => {
      if (typeof propertyId !== 'string') return;
      setLoading(true);
      try {
        const data = await dispatch(fetchPropertyBookings(propertyId)).unwrap();
        setBookings(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load bookings';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (typeof propertyId !== 'string') return;
    socket.emit('joinRoom', propertyId);

    const handleNewBooking = (newBooking: Booking) => {
      setBookings((prev) => [newBooking, ...prev]);
      toast.success('New booking request received!');
    };
    const handleStatusUpdate = (updated: Booking) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      toast.success(
        `Booking ${updated.id} status updated to ${updated.status}`
      );
    };

    socket.on('newBooking', handleNewBooking);
    socket.on('bookingStatusUpdate', handleStatusUpdate);

    return () => {
      socket.emit('leaveRoom', propertyId);
      socket.off('newBooking', handleNewBooking);
      socket.off('bookingStatusUpdate', handleStatusUpdate);
    };
  }, [propertyId]);

  const handleAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    setLoadingMap((map) => ({ ...map, [bookingId]: true }));
    try {
      if (action === 'confirm') {
        await dispatch(confirmBooking(bookingId)).unwrap();
      } else {
        await dispatch(rejectBooking(bookingId)).unwrap();
      }

      const updatedList = await dispatch(
        fetchPropertyBookings(propertyId as string)
      ).unwrap();
      setBookings(updatedList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast.error(msg);
    } finally {
      setLoadingMap((map) => ({ ...map, [bookingId]: false }));
    }
  };

  if (propLoading) return <p>Loading property…</p>;
  if (propError) return <p className="text-red-500">{propError}</p>;
  if (!property) return <p className="text-gray-600">Property not found.</p>;

  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginated = bookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <UserLayout>
      <div
        className={`min-h-screen p-6 transition-colors ${theme === 'dark'? 'bg-gray-900 text-gray-100': 'bg-gray-50 text-gray-900'}`}
      >
        <h1 className="text-3xl font-bold mb-6">
          Bookings for {property.title}
        </h1>
        {loading && <p>Loading bookings…</p>}
        {!loading && bookings.length === 0 && (
          <p className="text-gray-500">
            No booking requests yet for this property.
          </p>
        )}
        {!loading && paginated.length > 0 && (
          <div className="overflow-x-auto">
            <table
              className={`w-full min-w-[600px] rounded overflow-hidden shadow ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <thead
                className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}
              >
                <tr>
                  <th className="p-3 text-left">Tenant</th>
                  <th className="p-3 text-left">Dates</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr
                    key={b.id}
                    className={`border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <td className="p-3 break-words w-1/4">{b.tenant?.name}</td>
                    <td className="p-3 w-1/3">
                      {new Date(b.startDate).toLocaleDateString()} –{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 w-1/6">{b.status}</td>
                    <td className="p-3 text-center space-x-2 w-1/4">
                      {b.status === 'PENDING' ? (
                        <div className="flex justify-center space-x-2 flex-wrap">
                          <button
                            disabled={loadingMap[b.id]}
                            onClick={() => handleAction(b.id, 'confirm')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            disabled={loadingMap[b.id]}
                            onClick={() => handleAction(b.id, 'reject')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && bookings.length > pageSize && (
          <div className="mt-4 flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default PropertyBookingsPage;
