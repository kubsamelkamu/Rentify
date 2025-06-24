import React, {useEffect,useState,useCallback,useContext,} from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchPropertyReviews,upsertReview,deleteReview,Review,
} from '@/store/slices/reviewSlice';
import toast from 'react-hot-toast';
import socket, { connectSocket } from '@/utils/socket';
import { ThemeContext } from '@/components/context/ThemeContext';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PropertyReviewsProps {
  propertyId: string;
}

const PropertyReviews: React.FC<PropertyReviewsProps> = ({ propertyId }) => {
  
  const dispatch = useAppDispatch();
  const { theme } = useContext(ThemeContext)!;

  const bucket = useAppSelector(
    (state) => state.reviews.reviewsByProperty[propertyId]
  );
  const upsertLoading = useAppSelector((s) => s.reviews.upsertLoading);
  const deleteLoading = useAppSelector((s) => s.reviews.deleteLoading);
  const authUser = useAppSelector((s) => s.auth.user);

  const [page, setPage] = useState(1);
  const limit = 5;
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const loadPage = useCallback(() => {
    dispatch(fetchPropertyReviews({ propertyId, page, limit }));
  }, [dispatch, propertyId, page]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);
    const room = `reviews_${propertyId}`;
    socket.emit('joinRoom', room);
    socket.on('admin:newReview', loadPage);
    socket.on('admin:updateReview', loadPage);
    socket.on('admin:deleteReview', loadPage);
    return () => {
      socket.emit('leaveRoom', room);
      socket.off('admin:newReview', loadPage);
      socket.off('admin:updateReview', loadPage);
      socket.off('admin:deleteReview', loadPage);
    };
  }, [propertyId, loadPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        upsertReview({ propertyId, rating, title, comment })
      ).unwrap();
      toast.success('Review saved');
      setTitle('');
      setComment('');
      setRating(5);
      loadPage();
    } catch{
      toast.error('Could not save review');
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteReview(propertyId)).unwrap();
      toast.success('Review deleted');
      loadPage();
    } catch {
      toast.error('Could not delete review');
    }
  };

  if (!bucket || bucket.loading) {
    return <p className="text-center py-6">Loading reviews…</p>;
  }
  if (bucket.error) {
    return <p className="text-center text-red-500 py-6">{bucket.error}</p>;
  }

  const totalCount = bucket.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Reviews ({totalCount})
        </h2>
        <div className="flex items-center space-x-1">
          <Star size={16} className="text-yellow-500" />
          <span className="font-medium">
            {bucket.averageRating.toFixed(1)}
          </span>
        </div>
      </div>
      <ul className="space-y-4 mb-6">
        <AnimatePresence>
          {bucket.reviews.map((r: Review) => (
            <li key={r.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  theme === 'light'
                    ? 'bg-white shadow'
                    : 'bg-gray-800 shadow-gray-800/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {r.tenant.name}{' '}
                      <span className="text-gray-400 text-sm">
                        •{' '}
                        {new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </p>
                    <div className="flex items-center mt-1 space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < r.rating
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  {authUser?.id === r.tenant.id && (
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="text-red-600 hover:underline disabled:opacity-50 text-sm"
                    >
                      {deleteLoading ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
                <p className="mt-2 font-medium">{r.title}</p>
                <p className="mt-1 text-sm">{r.comment}</p>
              </motion.div>
            </li>
          ))}
        </AnimatePresence>

        {bucket.reviews.length === 0 && (
          <li className="text-center text-gray-500">
            No reviews yet.
          </li>
        )}
      </ul>
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 rounded disabled:opacity-50 border"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded disabled:opacity-50 border"
        >
          Next
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`p-6 rounded-lg ${
          theme === 'light'
            ? 'bg-white shadow'
            : 'bg-gray-800 shadow-gray-800/50'
        } space-y-4`}
      >
        <h3 className="text-lg font-medium">Write a Review</h3>
        <label className="flex items-center space-x-2">
          <span>Rating:</span>
          <select
            value={rating}
            onChange={(e) => setRating(+e.target.value)}
            className="border rounded px-2 py-1"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ⭐
              </option>
            ))}
          </select>
        </label>

        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Short summary"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Comment</label>
          <textarea
            value={comment}
            required
            rows={4}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Share your thoughts…"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={upsertLoading}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {upsertLoading ? 'Saving…' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setComment('');
              setRating(5);
            }}
            className="px-4 py-2 rounded border"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyReviews;
