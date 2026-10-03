import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import complaintService from '../../services/complaintService';
import categoryService from '../../services/categoryService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints({
        search,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
        page,
        limit: 8,
      });

      if (res.success) {
        setComplaints(res.complaints || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, priorityFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with New Complaint Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Complaints
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, search, and track all complaints registered by you
          </p>
        </div>
        <Link to="/student/submit">
          <Button variant="primary" icon={Plus} className="shadow-sm">
            Submit New Complaint
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search title, ID, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={Search}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Assigned', label: 'Assigned' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
              placeholder=""
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.name, label: c.name })),
              ]}
              placeholder=""
            />
          </div>

          {/* Priority Filter */}
          <div>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'Urgent', label: 'Urgent' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              placeholder=""
            />
          </div>
        </div>

        {/* Sorting and reset row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="bg-transparent font-medium text-slate-800 border-none focus:ring-0 cursor-pointer"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="priority-desc">Priority</option>
              <option value="status-asc">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Found <strong className="text-slate-900">{totalCount}</strong> complaint{totalCount !== 1 ? 's' : ''}
            </span>
            {(search || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaints List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Searching and filtering your complaints..." />
        ) : complaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Inbox}
              title="No complaints found"
              description={
                search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No complaints matched your active search or filter criteria. Try resetting filters.'
                  : 'You have not submitted any complaints yet.'
              }
              actionText={
                search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Clear Filters'
                  : 'Submit a Complaint'
              }
              onAction={
                search || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? handleResetFilters
                  : () => (window.location.href = '/student/submit')
              }
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">ID & Location</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-indigo-600 block">
                          {c.complaintId}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[150px]">
                          {c.hostel} • Rm {c.roomNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/student/complaints/${c._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition block truncate max-w-xs"
                        >
                          {c.title}
                        </Link>
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {c.description}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-700">
                        {c.category}
                      </td>
                      <td className="py-4 px-4">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(c.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/student/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={8}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaintsPage;
