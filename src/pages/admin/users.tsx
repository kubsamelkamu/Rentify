import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import api from '@/utils/api';
import { fetchUsers, deleteUser, User as AdminUser } from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';
import { debounce } from '@/utils/debounce';
import { Loader } from 'lucide-react';

const AdminUsersPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { users, loading, error, } = useAppSelector((state) => state.admin);
  const allFiltered = users.filter(u => u.role === 'TENANT' || u.role === 'LANDLORD');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const limit = 5;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(allFiltered.length / limit);
  const pageData = allFiltered.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);
    const handleNew = (newUser: AdminUser) => {
      toast(`New user joined: ${newUser.name}`, { icon: '👤' });
    };
    socket.on('admin:newUser', handleNew);
    return () => { socket.off('admin:newUser', handleNew); };
  }, []);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 1000, search }));
  }, [dispatch, search]);

  const debouncedSearch = debounce((...args: unknown[]) => {
    const val = String(args[0] || '');
    setPage(1);
    setSearch(val);
  }, 500);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('api/admin/users/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'rentify-users.xlsx';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success('Exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setDeletingIds(m => ({ ...m, [id]: true }));
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success('Deleted');
    } catch{
      toast.error('Delete failed: ');
    } finally {
      setDeletingIds(m => { const next = { ...m }; delete next[id]; return next; });
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Users</title>
      </Head>
      <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-blue-600 rounded-lg">
          <h1 className="text-white text-2xl font-bold">Manage Users</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search name or email…"
              className="flex-grow px-3 py-2 rounded border"
              onChange={e => debouncedSearch(e.target.value)}
            />
            <button
              onClick={handleExport}
              disabled={exporting || allFiltered.length === 0}
              className={`px-4 py-2 text-white rounded ${
                exporting || allFiltered.length === 0
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {exporting ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Export'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : allFiltered.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-blue-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-white text-left">Name</th>
                    <th className="px-4 py-2 text-white text-left hidden md:table-cell">Email</th>
                    <th className="px-4 py-2 text-white text-left">Role</th>
                    <th className="px-4 py-2 text-white text-left">Joined</th>
                    <th className="px-4 py-2 text-white text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageData.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <a href={`mailto:${u.email}`} className="text-blue-600">
                          {u.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingIds[u.id]}
                          className={`px-3 py-1 text-white rounded ${
                            deletingIds[u.id] ? 'bg-red-200' : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {deletingIds[u.id]
                            ? <Loader className="animate-spin h-4 w-4 mx-auto" />
                            : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center px-4 py-3 bg-blue-600 rounded-b-lg">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 text-white rounded ${
                  page === 1 ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 text-white rounded ${
                  page === totalPages ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-700'
                }`}
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

export default AdminUsersPage;



