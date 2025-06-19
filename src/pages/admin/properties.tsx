// src/pages/admin/properties.tsx
import { NextPage } from 'next';
import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProperties,
  deletePropertyByAdmin,
} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';

const PAGE_SIZE = 5;

const AdminPropertiesPage: NextPage = () => {
  const dispatch = useAppDispatch();
  const {
    properties,
    loading,
    error,
    propertiesPage,
    propertiesTotalPages,
  } = useAppSelector((s) => s.admin)!;

  const [page, setPage] = useState<number>(propertiesPage || 1);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const reload = useCallback(() => {
    dispatch(fetchProperties({ page, limit: PAGE_SIZE }));
  }, [dispatch, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);

    socket.on('admin:newProperty', reload);
    socket.on('admin:updateProperty', reload);
    socket.on('admin:deleteProperty', reload);

    return () => {
      socket.off('admin:newProperty', reload);
      socket.off('admin:updateProperty', reload);
      socket.off('admin:deleteProperty', reload);
    };
  }, [reload]);

  useEffect(() => {
    setPage(propertiesPage);
  }, [propertiesPage]);

  const handleDelete = async (id: string) => {
    setDeletingIds((m) => ({ ...m, [id]: true }));
    try {
      await dispatch(deletePropertyByAdmin(id)).unwrap();
      toast.success('Property deleted');
      if (properties.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        reload();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Delete failed: ' + message);
    } finally {
      setDeletingIds((m) => {
        const c = { ...m };
        delete c[id];
        return c;
      });
    }
  };

  const prev = () => page > 1 && setPage((p) => p - 1);
  const next = () => page < propertiesTotalPages && setPage((p) => p + 1);

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Properties</title>
        <meta name="description" content="Admin property management" />
      </Head>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">Manage Properties</h1>
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && properties.length === 0 && <p>No properties found.</p>}

        {properties.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">City</th>
                    <th className="px-4 py-2 text-left">Rent/mo</th>
                    <th className="px-4 py-2 text-left">Landlord</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">{p.title}</td>
                      <td className="px-4 py-3">{p.city}</td>
                      <td className="px-4 py-3">${p.rentPerMonth}</td>
                      <td className="px-4 py-3">{p.landlordId}</td>
                      <td className="px-4 py-3">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingIds[p.id]}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            deletingIds[p.id]
                              ? 'bg-red-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {deletingIds[p.id] ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between bg-blue-600 text-white px-4 py-2 rounded-b-lg">
              <button
                onClick={prev}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-blue-800 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {propertiesTotalPages}
              </span>
              <button
                onClick={next}
                disabled={page >= propertiesTotalPages}
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

export default AdminPropertiesPage;
