import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {fetchPropertyById,deleteProperty,} from '../../store/slices/propertySlice';

const PropertyDetailPage: NextPage = () => {

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { current, loading, error } = useAppSelector((state) => state.properties);
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchPropertyById(id));
    }
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!current?.id) return;

    const deletePromise = dispatch(deleteProperty(current.id)).unwrap();

    toast.promise(deletePromise, {
      loading: 'Deleting property...',
      success: 'Property successfully deleted!',
      error: 'Failed to delete property.',
    });

    try {
      await deletePromise;
      router.push('/properties');
    } catch {
      return;
    }
  };

  const canModify = authUser && current && authUser.id === current.landlord?.id;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && current && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {current.images && current.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {current.images.slice(0, 2).map((img) => (
                <div key={img.id} className="relative h-64 w-full">
                  <Image
                    src={img.url}
                    alt={img.fileName}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 w-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Images Available
            </div>
          )}

          <div className="p-8 relative">
            {canModify && (
              <div className="absolute top-6 right-6 flex space-x-2">
                <button
                  onClick={() => router.push(`/properties/${current.id}/edit`)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {current.title}
            </h1>
            <p className="text-gray-600 mb-4">{current.city}</p>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-2xl font-extrabold text-blue-600">
                ${current.rentPerMonth}/mo
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {current.propertyType}
              </span>
            </div>

            <p className="prose mb-6">{current.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700">
              <div>
                <strong>Bedrooms:</strong> {current.numBedrooms}
              </div>
              <div>
                <strong>Bathrooms:</strong> {current.numBathrooms}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {current.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 text-sm text-gray-700">
              <p>
                Listed by: <strong>{current.landlord?.name}</strong> (
                {current.landlord?.email})
              </p>
              <p className="mt-1">
                Created on:{' '}
                {new Date(current.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
