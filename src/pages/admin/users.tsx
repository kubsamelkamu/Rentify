import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import api from '@/utils/api';
import {fetchUsers,changeUserRole,deleteUser,User as AdminUser,} from '@/store/slices/adminSlice';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Head from 'next/head';
import socket, { connectSocket } from '@/utils/socket';
import { debounce } from '@/utils/debounce';
import { Loader } from 'lucide-react';

const AdminUsersPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const { users, loading, error, usersPage, usersTotalPages } = useAppSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState<number>(usersPage);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [changingRoleIds, setChangingRoleIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const limit = 5;

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    connectSocket(token);

    const handleNewUser = (newUser: AdminUser) => {
      toast(`New user joined: ${newUser.name}`, { icon: '👤' });
    };

    socket.on('admin:newUser', handleNewUser);
    return () => {
      socket.off('admin:newUser', handleNewUser);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit, search }));
  }, [dispatch, page, search]);

  const debouncedSearch = debounce((...args: unknown[]) => {
    const value = args[0] as string;
    setPage(1);
    setSearch(value);
  }, 500);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('api/admin/users/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rentify-users.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Users exported successfully');
    } catch {
      toast.error('Failed to export users: ');
    } finally {
      setExporting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AdminUser['role']) => {
    setChangingRoleIds((m) => ({ ...m, [userId]: true }));
    try {
      await dispatch(changeUserRole({ userId, role: newRole })).unwrap();
      toast.success('User role updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not change role: ' + msg);
    } finally {
      setChangingRoleIds((m) => {
        const next = { ...m };
        delete next[userId];
        return next;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingIds((m) => ({ ...m, [userId]: true }));
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('User deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not delete user: ' + msg);
    } finally {
      setDeletingIds((m) => {
        const next = { ...m };
        delete next[userId];
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < usersTotalPages) setPage(page + 1);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Rentify | Manage Users</title>
        <meta
          name="description"
          content="Admin page to manage users for Rentify, including real-time updates."
        />
      </Head>

      <div className="flex flex-col space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-600 rounded-lg space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Manage Users</h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name or email..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="flex-grow px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none w-full sm:w-64"
            />

            <button
              onClick={handleExport}
              disabled={exporting || users.length === 0}
              aria-busy={exporting}
              className={`flex justify-center items-center px-4 py-2 rounded text-white transition w-full sm:w-auto ${
                exporting || users.length === 0
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {exporting ? <Loader className="animate-spin mr-2 h-4 w-4" /> : null}
              {exporting ? 'Exporting…' : 'Export Users'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        )}

        {error && <p className="text-red-500">Error loading users: {error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="text-gray-600">No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                <thead className="bg-blue-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white hidden md:table-cell">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-white">Joined</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{u.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm hidden md:table-cell">
                        <a href={`mailto:${u.email}`} className="text-blue-600 hover:underline">{u.email}</a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as AdminUser['role'])}
                          disabled={changingRoleIds[u.id]}
                          className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        >
                          <option value="TENANT">Tenant</option>
                          <option value="LANDLORD">Landlord</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-1">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deletingIds[u.id]}
                          className={`px-3 py-1 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            deletingIds[u.id]
                              ? 'bg-red-200 cursor-not-allowed'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >{deletingIds[u.id] ? <Loader className="animate-spin h-4 w-4 mx-auto" /> : 'Delete'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                Page {page} of {usersTotalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= usersTotalPages}
                className={`px-3 py-1 rounded text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-white ${
                  page >= usersTotalPages
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-800 hover:bg-blue-700'
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
