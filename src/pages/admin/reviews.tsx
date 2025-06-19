// src/pages/admin/reviews.tsx
import { NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';
import { fetchReviews, deleteReview } from '@/store/slices/adminSlice';

const PAGE_SIZE = 5;

const AdminReviewsPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const {
    reviews,
    loading,
    error,
    reviewsPage,
    reviewsTotalPages,
  } = useAppSelector((state) => state.admin)!;

  const [currentPage, setCurrentPage] = useState<number>(reviewsPage);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const reload = useCallback(() => {
    dispatch(fetchReviews({ page: currentPage, limit: PAGE_SIZE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setCurrentPage(reviewsPage);
  }, [reviewsPage]);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);

    socket.on('admin:newReview', reload);
    socket.on('admin:updateReview', reload);
    socket.on('admin:deleteReview', reload);

    return () => {
      socket.off('admin:newReview', reload);
      socket.off('admin:updateReview', reload);
      socket.off('admin:deleteReview', reload);
    };
  }, [reload]);

  const handleDelete = async (reviewId: string) => {
    setDeletingIds((m) => ({ ...m, [reviewId]: true }));
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Review deleted');
      reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Could not delete review: ' + message);
    } finally {
      setDeletingIds((m) => {
        const next = { ...m };
        delete next[reviewId];
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < reviewsTotalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Reviews</title>
        <meta
          name="description"
          content="Admin page to manage reviews for Rentify."
        />
        <link rel="canonical" href="/admin/reviews" />
      </Head>

      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">Manage Reviews</h1>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && <p className="text-red-500">Error loading reviews: {error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="text-gray-600">No reviews found.</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Property</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Tenant</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Rating</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Comment</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Created At</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviews.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 whitespace-nowrap">{r.property?.title}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.tenant?.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            r.rating >= 4
                              ? 'bg-green-200 text-green-800'
                              : r.rating >= 2
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {r.rating} / 5
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.title}</td>
                      <td className="px-4 py-3 break-words">{r.comment}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingIds[r.id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            deletingIds[r.id]
                              ? 'opacity-50 cursor-not-allowed bg-red-400 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {deletingIds[r.id] ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reviewsTotalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-800 disabled:opacity-50 hover:bg-gray-300"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-gray-800">
                  Page {currentPage} of {reviewsTotalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === reviewsTotalPages}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-800 disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
