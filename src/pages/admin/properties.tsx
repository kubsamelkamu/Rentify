import React, { Fragment, useEffect, useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchProperties,deletePropertyByAdmin,approveProperty,rejectProperty,} from '@/store/slices/adminSlice';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';
import { Loader } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  city: string;
  rentPerMonth: number;
  numBedrooms: number;
  numBathrooms: number;
  propertyType: string;
  amenities: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  landlord: { id: string; name: string; email: string };
  images: { id: string; url: string }[];
}

const AdminPropertiesPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const {properties,propertiesPage,propertiesLimit,propertiesTotalPages,loading,} = useAppSelector((s) => s.admin);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) connectSocket(token);

    dispatch(fetchProperties({ page: propertiesPage, limit: propertiesLimit }));

    const reload = () =>
      dispatch(fetchProperties({ page: propertiesPage, limit: propertiesLimit }));
    socket.on('listing:approved', reload);
    socket.on('listing:rejected', reload);
    socket.on('listing:pending', reload);
    return () => {
      socket.off('listing:approved', reload);
      socket.off('listing:rejected', reload);
      socket.off('listing:pending', reload);
    };
  }, [dispatch, propertiesPage, propertiesLimit]);

  const handleApprove = (id: string) =>
    dispatch(approveProperty(id))
      .unwrap()
      .then(() => toast.success('Approved'))
      .catch((e) => toast.error(e));

  const handleDelete = (id: string) => {
    if (!confirm('Delete this property?')) return;
    dispatch(deletePropertyByAdmin(id))
      .unwrap()
      .then(() => toast.success('Deleted'))
      .catch((e) => toast.error(e));
  };

  const handleReject = (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    dispatch(rejectProperty({ propertyId: id, reason }))
      .unwrap()
      .then(() => toast.success('Rejected'))
      .catch((e) => toast.error(e));
  };

  const prev = () =>
    propertiesPage > 1 &&
    dispatch(fetchProperties({ page: propertiesPage - 1, limit: propertiesLimit }));
  const next = () =>
    propertiesPage < propertiesTotalPages &&
    dispatch(fetchProperties({ page: propertiesPage + 1, limit: propertiesLimit }));

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Properties</title>
      </Head>

      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  {['Title', 'City', 'Rent', 'Status', 'Created', '⋯'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-sm font-medium text-white"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {properties.map((p) => (
                  <Fragment key={p.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === p.id ? null : p.id)
                      }
                    >
                      <td className="px-4 py-2 text-sm">{p.title}</td>
                      <td className="px-4 py-2 text-sm">{p.city}</td>
                        <td className="px-4 py-2 text-sm">
                          {(() => {
                            const rentNum = typeof p.rentPerMonth === 'string'
                              ? parseFloat(p.rentPerMonth)
                              : Number(p.rentPerMonth);
                            return rentNum.toFixed(0);    
                            })()} ETB
                          </td>
                      <td className="px-4 py-2 text-sm">{p.status}</td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">▶</td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {expandedId === p.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td colSpan={6} className="px-4 py-3 bg-gray-50">
                            <PropertyDetailsRow
                              propertyId={p.id}
                              onApprove={() => handleApprove(p.id)}
                              onReject={() => handleReject(p.id)}
                              onDelete={() => handleDelete(p.id)}
                            />
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-3 bg-blue-600 text-white">
              <button
                onClick={prev}
                disabled={propertiesPage <= 1}
                className={`px-3 py-1 rounded ${
                  propertiesPage <= 1
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-800 hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              <span>
                Page {propertiesPage} of {propertiesTotalPages}
              </span>
              <button
                onClick={next}
                disabled={propertiesPage >= propertiesTotalPages}
                className={`px-3 py-1 rounded ${
                  propertiesPage >= propertiesTotalPages
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-800 hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPropertiesPage;

function PropertyDetailsRow({
  propertyId,
  onApprove,
  onReject,
  onDelete,
}: {
  propertyId: string;
  onApprove(): void;
  onReject(): void;
  onDelete(): void;
}) {
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get<PropertyDetail>(`/api/properties/${propertyId}`)
      .then((r) => setDetail(r.data))
      .catch(() => toast.error('Failed to load details'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading || !detail) {
    return (
      <div className="py-4 text-center text-gray-500">
        {loading ? 'Loading details…' : 'No details available'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        {detail.images.slice(0, 3).map((img) => (
          <div
            key={img.id}
            className="relative w-1/3 h-32 rounded overflow-hidden"
          >
            <Image src={img.url} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <p className="text-gray-700">{detail.description}</p>
      <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <li>
          <strong>Bedrooms:</strong> {detail.numBedrooms}
        </li>
        <li>
          <strong>Bathrooms:</strong> {detail.numBathrooms}
        </li>
        <li>
          <strong>Type:</strong> {detail.propertyType}
        </li>
        <li>
          <strong>Amenities:</strong> {detail.amenities.join(', ')}
        </li>
        <li className="col-span-2">
          <strong>Landlord:</strong> {detail.landlord.name} (
          {detail.landlord.email})
        </li>
      </ul>
      <div className="flex space-x-2">
        {detail.status === 'PENDING' && (
          <>
            <button
              onClick={onApprove}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Reject
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
