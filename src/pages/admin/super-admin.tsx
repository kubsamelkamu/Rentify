'use client';
import { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {fetchAdmins,createAdmin,deleteAdmin,clearAdminError,} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Loader } from 'lucide-react';
import { debounce } from '@/utils/debounce';
import type { User } from '@/store/slices/adminSlice';

const PAGE_LIMIT = 5;

const SuperAdminPage: NextPage = () => {
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth)!;
  const {admins,loading,error,saPage: page,saTotalPages,} = useAppSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
      if (user?.role !== 'SUPER_ADMIN') {
        toast.error('You do not have permission to access this page.');
        window.location.href = '/admin/';
        return;
      }
  })

  useEffect(() => {
    dispatch(fetchAdmins({ page, limit: PAGE_LIMIT }));
  }, [dispatch, page]);

  const onSearch = debounce((...args: unknown[]) => {
    setSearch(String(args[0] ?? ''));
  }, 500);

  const filtered = admins.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await dispatch(createAdmin(formData));
    setCreating(false);
    if (createAdmin.fulfilled.match(res)) {
      toast.success('Admin created');
      setFormData({ name: '', email: '', password: '' });
      dispatch(fetchAdmins({ page, limit: PAGE_LIMIT }));
    } else {
      toast.error(res.payload as string);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await dispatch(deleteAdmin(id));
    setDeletingId(null);
    if (deleteAdmin.fulfilled.match(res)) {
      toast.success('Deleted');
      dispatch(fetchAdmins({ page, limit: PAGE_LIMIT }));
    } else {
      toast.error(res.payload as string);
    }
  };

  const handlePrev = () => {
    if (page > 1) dispatch(fetchAdmins({ page: page - 1, limit: PAGE_LIMIT }));
  };
  const handleNext = () => {
    if (page < saTotalPages)
      dispatch(fetchAdmins({ page: page + 1, limit: PAGE_LIMIT }));
  };

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Admins</title>
        <meta name="description" content="Super‑admin management dashboard" />
      </Head>

      <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-600 rounded-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Manage Admins
          </h1>
          <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={(e) => onSearch(e.target.value)}
              className="flex-grow px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none w-full sm:w-64"
            />
            <button
              className="btn btn-sm btn-outline text-white"
              onClick={() => {
                setSearch('');
                dispatch(clearAdminError());
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {error && <p className="text-red-500">Error: {error}</p>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              required
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input input-bordered w-full"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input input-bordered w-full"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="input input-bordered w-full"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="btn btn-primary"
          >
            {creating ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Create Admin'}
          </button>
        </form>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
              <thead className="bg-blue-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Joined
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-600"
                    >
                      No super‑admins found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: User) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm hidden md:table-cell">
                        <a
                          href={`mailto:${u.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {u.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        ADMIN
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className={`px-3 py-1 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            deletingId === u.id
                              ? 'bg-red-200 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          {deletingId === u.id ? (
                            <Loader className="animate-spin h-4 w-4 mx-auto" />
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && !loading && !error && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-blue-600 rounded-b-lg space-y-2 sm:space-y-0">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className={`px-3 py-1 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-white ${
                page <= 1
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-white text-sm">
              Page {page} of {saTotalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page >= saTotalPages}
              className={`px-3 py-1 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-white ${
                page >= saTotalPages
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SuperAdminPage;
