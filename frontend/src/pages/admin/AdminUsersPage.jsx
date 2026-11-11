import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  Search,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck
} from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [actionUserId, setActionUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter]);

  const handleToggleStatus = async (user) => {
    try {
      setActionUserId(user._id);
      const res = await adminService.toggleUserStatus(user._id);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isSuspended: res.isSuspended } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2.5">
          <Users className="w-7 h-7 text-purple-400" />
          <span>Student Accounts</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Review registered accounts, track progress ratings, and manage platform access privileges.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search students by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-xs font-medium text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="">All Account Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {/* User Table Card */}
      <div className="rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16">
            <Loader message="Loading student directory..." />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232738] bg-[#171A26] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-center">Rating</th>
                  <th className="py-3.5 px-4 text-center">Battles (W/L)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232738]/50 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1A1D2B]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg bg-[#0F1118] border border-[#232738]"
                        />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[10px] text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          u.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-amber-400 font-mono">
                      {u.rating} ELO
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-300 font-mono">
                      {u.battleStats?.wins || 0}W / {u.battleStats?.losses || 0}L
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isSuspended
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionUserId === u._id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ml-auto transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                              : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30'
                          }`}
                        >
                          {u.isSuspended ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500 text-xs">No users found.</div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#171A26] border-t border-[#232738] text-xs">
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-[#2A2E42] text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-[#2A2E42] text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

