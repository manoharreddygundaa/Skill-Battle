import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { Loader } from '../../components/common/Loader';
import {
  Code2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const AdminProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getProblems({
        page,
        limit: 10,
        search: search.trim() || undefined,
        difficulty: difficulty || undefined
      });
      if (res.success) {
        setProblems(res.problems);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load admin problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, difficulty]);

  const handleDelete = async (id) => {
    try {
      const res = await adminService.deleteProblem(id);
      if (res.success) {
        setProblems((prev) => prev.filter((p) => p._id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Code2 className="w-7 h-7 text-purple-400" />
            <span>Problem Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Author, edit, test, and remove coding challenges and test suites.
          </p>
        </div>

        <Link
          to="/admin/problems/create"
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 flex items-center space-x-1.5 transition-all self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Problem</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
            placeholder="Search problems by title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-[#0F1118] border border-[#232738] text-xs font-medium text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16">
            <Loader message="Loading problems for management..." />
          </div>
        ) : problems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232738] bg-[#171A26] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Title & Slug</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Function</th>
                  <th className="py-3.5 px-4 text-center">Sample Tests</th>
                  <th className="py-3.5 px-4 text-center">Hidden Tests</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232738]/50 text-xs">
                {problems.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1A1D2B]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{p.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono">/{p.slug}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {p.functionName}()
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono">
                      {p.sampleTestCases?.length || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono">
                      {p.hiddenTestCases?.length || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/admin/problems/edit/${p._id}`}
                        className="inline-flex items-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#232738] transition-colors"
                        title="Edit Problem"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      {deleteConfirmId === p._id ? (
                        <span className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-[#232738] text-gray-400 rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-500 text-xs">No problems found.</div>
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

