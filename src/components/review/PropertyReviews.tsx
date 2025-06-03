import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchPropertyReviews,upsertReview,deleteReview,Review,} from '@/store/slices/reviewSlice';
import toast from 'react-hot-toast';

interface PropertyReviewsProps {
  propertyId: string;
}

export default function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const dispatch = useAppDispatch();
  const bucket = useAppSelector((state) => state.reviews.reviewsByProperty[propertyId]);
  const upsertLoading = useAppSelector((state) => state.reviews.upsertLoading);
  const deleteLoading = useAppSelector((state) => state.reviews.deleteLoading);

  const [page, setPage] = useState<number>(1);
  const limit = 5; 

  useEffect(() => {
    dispatch(fetchPropertyReviews({ propertyId, page, limit }));
  }, [dispatch, propertyId, page]);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(upsertReview({ propertyId, rating, title, comment })).unwrap();
      toast.success('Review saved');
      setTitle('');
      setComment('');
      dispatch(fetchPropertyReviews({ propertyId, page, limit }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteReview(propertyId)).unwrap();
      toast.success('Review deleted');
      dispatch(fetchPropertyReviews({ propertyId, page, limit }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    }
  };

  if (!bucket || bucket.loading) {
    return <p>Loading reviews…</p>;
  }
  if (bucket.error) {
    return <p className="text-red-500">{bucket.error}</p>;
  }

  const totalCount = bucket.count;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        Reviews ({totalCount}) • Average: {bucket.averageRating.toFixed(1)}
      </h2>

      <ul className="space-y-4 mb-4">
        {bucket.reviews.map((r: Review) => (
          <li key={r.id} className="border p-4 rounded-md">
            <p className="font-medium">
              {r.tenant.name} • {new Date(r.createdAt).toLocaleDateString()}
            </p>
            <p>⭐ {r.rating} • {r.title}</p>
            <p className="mt-1">{r.comment}</p>
          </li>
        ))}
        {bucket.reviews.length === 0 && (
          <li className="text-gray-500">No reviews on this page.</li>
        )}
      </ul>
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages === 0 ? 1 : totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <h3 className="text-lg font-medium">Write a Review</h3>
        <label className="block">
          Rating:
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="ml-2 border rounded px-2"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ⭐
              </option>
            ))}
          </select>
        </label>
        <div>
          <label className="block text-sm">Title</label>
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm">Comment</label>
          <textarea
            value={comment}
            required
            rows={4}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={upsertLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {upsertLoading ? 'Saving…' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="ml-2 text-red-600 hover:underline disabled:opacity-50"
        >
          {deleteLoading ? 'Deleting…' : 'Delete My Review'}
        </button>
      </form>
    </div>
  );
}
