import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../../services/problemService';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Loader } from '../../components/common/Loader';
import {
  Search,
  Filter,
  Code2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';

export const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        difficulty: difficulty || undefined,
        tag: selectedTag || undefined,
        status: statusFilter || undefined
      };

      const res = await problemService.getProblems(params);
      if (res.success) {
        setProblems(res.problems);
        setAvailableTags(res.tags || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, difficulty, selectedTag, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProblems();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Code2 className="w-7 h-7 text-purple-400" />
            <span>Problem Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse original coding challenges, sharpen your algorithmic skills, and submit solutions.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="font-semibold text-white">{pagination.total}</span> challenges available
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#141622] border border-[#232738] space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </form>

          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-xs font-medium text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-xs font-medium text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="unsolved">Unsolved</option>
          </select>

          {/* Tags Dropdown */}
          {availableTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl bg-[#0F1118] border border-[#232738] text-xs font-medium text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">All Topics</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-2xl bg-[#141622] border border-[#232738] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16">
            <Loader message="Loading coding problems..." />
          </div>
        ) : problems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232738] bg-[#171A26] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-center">Acceptance</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232738]/50 text-xs">
                {problems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="hover:bg-[#1A1D2B]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <StatusBadge status={problem.userStatus} />
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="font-semibold text-white group-hover:text-purple-400 transition-colors"
                      >
                        {problem.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags?.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-[#1C2030] text-[10px] text-gray-400 border border-[#2A2E42]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono">
                      {problem.acceptanceRate || 0}%
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#1C2030] hover:bg-purple-600 hover:text-white text-gray-300 font-medium text-xs transition-all"
                      >
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Code2 className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400 font-semibold">No problems found</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search criteria or difficulty filters.
            </p>
          </div>
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
                className="p-1.5 rounded-lg border border-[#2A2E42] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-[#2A2E42] text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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

