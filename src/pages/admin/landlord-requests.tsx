import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {fetchLandlordRequests,approveLandlordRequest,rejectLandlordRequest,clearLandlordRequestError,LandlordRequest,} from '@/store/slices/landlordRequestSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';

const STATUSES: Array<'PENDING'|'APPROVED'|'REJECTED'> = ['PENDING','APPROVED','REJECTED'];
const LIMIT = 5;

const AdminLandlordRequestsPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'PENDING'|'APPROVED'|'REJECTED'>('PENDING');

  const {requests,loading,error,totalPages,totalRequests,} = useAppSelector((state) => state.landlordRequests);

  useEffect(() => {
    dispatch(fetchLandlordRequests({ page, limit: LIMIT, status }));
  }, [dispatch, page, status]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearLandlordRequestError());
    }
  }, [error, dispatch]);

  const handleApprove = async (userId: string) => {
    try {
      await dispatch(approveLandlordRequest(userId)).unwrap();
      toast.success('Application approved');
      if (requests.length === 1 && page > 1) setPage(page - 1);
      else dispatch(fetchLandlordRequests({ page, limit: LIMIT, status }));
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await dispatch(rejectLandlordRequest({ userId, reason })).unwrap();
      toast.success('Application rejected');
      if (requests.length === 1 && page > 1) setPage(page - 1);
      else dispatch(fetchLandlordRequests({ page, limit: LIMIT, status }));
    } catch {
      toast.error('Failed to reject');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Landlord Applications</h1>
      <div className="mb-4 flex space-x-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {s[0] + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="animate-spin h-10 w-10 text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No {status.toLowerCase()} applications.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-700">
            Showing {requests.length} of {totalRequests}{' '}
            {status.toLowerCase()} applications
          </p>

          <div className="space-y-6">
            {requests.map((req: LandlordRequest) => (
              <div
                key={req.id}
                className="border p-4 rounded-lg bg-white shadow"
              >
                <div className="flex items-center space-x-4">
                  {req.profilePhoto ? (
                    <Image
                      src={req.profilePhoto}
                      alt={`${req.name} avatar`}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      N/A
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{req.name}</p>
                    <p className="text-sm text-gray-600">{req.email}</p>
                    <p className="text-xs text-gray-500">
                      Requested on{' '}
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {req.landlordDocs.map((doc) => (
                    <div key={doc.id} className="border rounded overflow-hidden">
                      <Image
                        src={doc.url}
                        alt={doc.docType}
                        width={320}
                        height={160}
                        className="object-cover w-full h-32"
                      />
                      <p className="text-sm p-2">Type: {doc.docType}</p>
                    </div>
                  ))}
                </div>
                {status === 'PENDING' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {status !== 'PENDING' && (
                  <p className="mt-4 text-sm italic text-gray-600">
                    {status.toLowerCase()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-blue-600 rounded-lg">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded ${
                page <= 1
                  ? 'opacity-50 bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700'
              } text-white`}
            >
              Previous
            </button>

            <span className="text-white">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded ${
                page >= totalPages
                  ? 'opacity-50 bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700'
              } text-white`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminLandlordRequestsPage;
