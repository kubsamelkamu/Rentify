import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchProperties,deletePropertyByAdmin,approveProperty,rejectProperty,
} from '@/store/slices/adminSlice';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 

interface PropertySummary {
  id: string;
  title: string;
  city: string;
  rentPerMonth: string | number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;      
}

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  city: string;
  rentPerMonth: string | number;
  numBedrooms: number;
  numBathrooms: number;
  propertyType: string;
  amenities: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  createdAt: string;
  landlord: { id: string; name: string; email: string };
  images: { id: string; url: string }[];
}

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AdminPropertiesPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { properties, propertiesPage, propertiesLimit, propertiesTotalPages, loading } =
    useAppSelector((s) => s.admin);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [propertyToReject, setPropertyToReject] = useState<string | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [propertyDetail, setPropertyDetail] = useState<PropertyDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'images'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) connectSocket(token);
    
    // Moved reload function inside useEffect to fix dependency warning
    const reload = () => {
      dispatch(fetchProperties({ page: propertiesPage, limit: propertiesLimit }));
    };

    reload();

    socket.on('listing:approved', reload);
    socket.on('listing:rejected', reload);
    socket.on('listing:pending', reload);
    
    return () => {
      socket.off('listing:approved', reload);
      socket.off('listing:rejected', reload);
      socket.off('listing:pending', reload);
    };
  }, [dispatch, propertiesPage, propertiesLimit]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this property?')) return;
    dispatch(deletePropertyByAdmin(id))
      .unwrap()
      .then(() => toast.success('Deleted'))
      .catch((e) => toast.error(e));
  };

  const handleApprove = (id: string) => {
    dispatch(approveProperty(id))
      .unwrap()
      .then(() => toast.success('Approved'))
      .catch((e) => toast.error(e));
  };

  const openRejectModal = (id: string) => {
    setPropertyToReject(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setPropertyToReject(null);
    setRejectReason('');
  };

  const submitReject = () => {
    if (!rejectReason.trim() || !propertyToReject) {
      return toast.error('Enter a reason');
    }
    dispatch(rejectProperty({ propertyId: propertyToReject, reason: rejectReason.trim() }))
      .unwrap()
      .then(() => {
        toast.success('Rejected');
        closeRejectModal();
      })
      .catch((e) => toast.error(e));
  };

  const openDetailModal = async (id: string) => {
    setDetailLoading(true);
    try {
      const { data } = await axios.get<PropertyDetail>(`/api/properties/${id}`);
      setPropertyDetail(data);
      setActiveTab('overview');
      setShowDetailModal(true);
    } catch{
      toast.error('Failed to fetch details');
    } finally {
      setDetailLoading(false);
    }
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setPropertyDetail(null);
  };

  const prev = () => {
    if (propertiesPage > 1) {
      dispatch(fetchProperties({ page: propertiesPage - 1, limit: propertiesLimit }));
    }
  };
  const next = () => {
    if (propertiesPage < propertiesTotalPages) {
      dispatch(fetchProperties({ page: propertiesPage + 1, limit: propertiesLimit }));
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Admin | Manage Properties</title>
      </Head>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Properties</h1>

        {loading && <p className="text-gray-500">Loading…</p>}

        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              {['Title', 'City', 'Rent', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p: PropertySummary) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">{p.city}</td>
                <td className="px-4 py-3">
                  $
                  {Number(p.rentPerMonth).toFixed(2).replace(/\.00$/, '')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : p.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.status === 'REJECTED' && p.rejectionReason && (
                    <p className="text-xs text-gray-500 mt-1">
                      Reason: {p.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 space-y-1">
                  {p.status === 'PENDING' && (
                    <div className="space-x-1 mb-1">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(p.id)}
                        className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openDetailModal(p.id)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={propertiesPage === 1}
            className={`px-4 py-2 rounded ${
              propertiesPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {propertiesPage} of {propertiesTotalPages}
          </span>
          <button
            onClick={next}
            disabled={propertiesPage === propertiesTotalPages}
            className={`px-4 py-2 rounded ${
              propertiesPage === propertiesTotalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>

        {showRejectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Reject Property</h2>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason"
                className="w-full p-2 border rounded resize-none"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReject}
                  className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden">
              <div className="flex border-b">
                {(['overview', 'images'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-center py-3 font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' ? 'Overview' : 'Images'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {detailLoading || !propertyDetail ? (
                  <p>Loading details…</p>
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    {activeTab === 'overview' && (
                      <motion.div
                        key="ov"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <h2 className="text-2xl font-bold">{propertyDetail.title}</h2>
                        <p className="text-gray-700">{propertyDetail.description}</p>
                        <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <li>
                            <strong>City:</strong> {propertyDetail.city}
                          </li>
                          <li>
                            <strong>Rent/month:</strong> $
                            {Number(propertyDetail.rentPerMonth)
                              .toFixed(2)
                              .replace(/\.00Br/, '')}
                          </li>
                          <li>
                            <strong>Bedrooms:</strong> {propertyDetail.numBedrooms}
                          </li>
                          <li>
                            <strong>Bathrooms:</strong> {propertyDetail.numBathrooms}
                          </li>
                          <li>
                            <strong>Type:</strong> {propertyDetail.propertyType}
                          </li>
                          <li>
                            <strong>Amenities:</strong>{' '}
                            {propertyDetail.amenities.join(', ')}
                          </li>
                          {propertyDetail.status === 'REJECTED' &&
                            propertyDetail.rejectionReason && (
                              <li className="col-span-2 text-red-600">
                                <strong>Rejection Reason:</strong>{' '}
                                {propertyDetail.rejectionReason}
                              </li>
                            )}
                          <li className="col-span-2">
                            <strong>Listed On:</strong>{' '}
                            {new Date(propertyDetail.createdAt).toLocaleDateString()}
                          </li>
                          <li className="col-span-2 bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Landlord</h3>
                            <p>{propertyDetail.landlord.name}</p>
                            <p>{propertyDetail.landlord.email}</p>
                          </li>
                        </ul>
                      </motion.div>
                    )}

                    {activeTab === 'images' && (
                      <motion.div
                        key="img"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                      >
                        {propertyDetail.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-4">
                            {propertyDetail.images.map((img) => (
                              <div
                                key={img.id}
                                className="aspect-w-4 aspect-h-3 bg-gray-100 rounded overflow-hidden relative"
                              >
                                {/* Replaced img with Next.js Image component */}
                                <Image
                                  src={img.url}
                                  alt={propertyDetail.title}
                                  className="object-cover"
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No images available.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              <div className="border-t p-4 text-right">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPropertiesPage;