import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCw,
  Building,
  User,
  Shield,
  FileText,
  Inbox,
} from 'lucide-react';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const AdminComplaintsPage = () => {
  const [searchParams] = useSearchParams();
  const initialPriority = searchParams.get('priority') || 'all';

  const { success, error } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [hostelFilter, setHostelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states for modals
  const [newStatus, setNewStatus] = useState('In Progress');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Campus Electrician Team');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      const res = await adminService.getAllComplaints({
        search,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        hostel: hostelFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10,
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
  }, [search, statusFilter, categoryFilter, priorityFilter, hostelFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Action handlers
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      setActionLoading(true);
      const res = await adminService.updateComplaintStatus(activeComplaint._id, {
        status: newStatus,
        remarks: statusRemarks,
      });
      if (res.success) {
        success(`Status updated to "${newStatus}"!`);
        setIsStatusModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      setActionLoading(true);
      const res = await adminService.assignComplaint(activeComplaint._id, {
        assignedUserName: assignedStaff,
        remarks: assignRemarks,
      });
      if (res.success) {
        success(`Assigned to ${assignedStaff}!`);
        setIsAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    if (!resolutionNotes.trim()) {
      error('Please write resolution notes');
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.resolveComplaint(activeComplaint._id, {
        resolutionNotes,
      });
      if (res.success) {
        success('Complaint marked as Resolved!');
        setIsResolveModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeComplaint) return;
    if (!rejectionReason.trim()) {
      error('Please provide a reason for rejection');
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.rejectComplaint(activeComplaint._id, {
        rejectionReason,
      });
      if (res.success) {
        success('Complaint marked as Rejected.');
        setIsRejectModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setHostelFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hostel Complaints Master Directory
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Triage, assign, investigate, and resolve grievances across all campus residential halls
        </p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by ID, title, student name, room..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={Search}
            />
          </div>

          {/* Status */}
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
            />
          </div>

          {/* Category */}
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
            />
          </div>

          {/* Priority */}
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
            />
          </div>
        </div>

        {/* Sort & Quick Counters */}
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
              <option value="priority-desc">Urgency Priority</option>
              <option value="status-asc">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Showing <strong className="text-slate-900">{totalCount}</strong> complaint{totalCount !== 1 ? 's' : ''}
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

      {/* Complaints Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Querying database complaints..." />
        ) : complaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Inbox}
              title="No complaints matching query"
              description="Try adjusting your filter options or search keyword."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">ID & Student</th>
                    <th className="py-3.5 px-4">Title & Description</th>
                    <th className="py-3.5 px-4">Hostel / Room</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned To</th>
                    <th className="py-3.5 px-6 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      {/* ID & Student */}
                      <td className="py-4 px-6">
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="font-mono text-xs font-extrabold text-indigo-600 hover:underline block"
                        >
                          {c.complaintId}
                        </Link>
                        <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate max-w-[140px]">
                          {c.submittedBy?.name || 'Student'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {c.submittedBy?.studentId || ''}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="py-4 px-4">
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition block truncate max-w-xs"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                          {c.description}
                        </p>
                      </td>

                      {/* Hostel & Room */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                        <span className="block font-semibold">{c.hostel}</span>
                        <span className="text-slate-400">
                          {c.block} • Room {c.roomNumber}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-medium text-slate-600">
                        {c.category}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Assignee */}
                      <td className="py-4 px-4 text-xs">
                        {c.assignedTo?.name ? (
                          <span className="font-semibold text-slate-700 block truncate max-w-[120px]">
                            {c.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Action Menu / Buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/admin/complaints/${c._id}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Quick Assign */}
                          <button
                            onClick={() => {
                              setActiveComplaint(c);
                              setAssignedStaff(c.assignedTo?.name || 'Campus Maintenance Team');
                              setIsAssignModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                            title="Assign Personnel"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          {/* Quick Status Update */}
                          <button
                            onClick={() => {
                              setActiveComplaint(c);
                              setNewStatus(c.status);
                              setStatusRemarks(c.adminRemarks || '');
                              setIsStatusModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition"
                            title="Update Status"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          {/* Quick Resolve */}
                          {c.status !== 'Resolved' && (
                            <button
                              onClick={() => {
                                setActiveComplaint(c);
                                setResolutionNotes('');
                                setIsResolveModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                              title="Mark Resolved"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Reject */}
                          {c.status !== 'Rejected' && c.status !== 'Resolved' && (
                            <button
                              onClick={() => {
                                setActiveComplaint(c);
                                setRejectionReason('');
                                setIsRejectModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                              title="Reject Complaint"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
              pageSize={10}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {/* Modal: Update Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Complaint Status"
        subtitle={`Ticket: ${activeComplaint?.complaintId} - ${activeComplaint?.title}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
            required
          />

          <Textarea
            label="Admin Remarks / Inspection Notes"
            rows={3}
            placeholder="Add update remarks to be logged in the public timeline..."
            value={statusRemarks}
            onChange={(e) => setStatusRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Complaint */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Maintenance Personnel"
        subtitle={`Ticket: ${activeComplaint?.complaintId}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Select Assignee / Maintenance Staff"
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
            options={[
              { value: 'Campus Electrician Team', label: 'Campus Electrician Team (Lead: Sharma)' },
              { value: 'Hostel Plumbing Contractor', label: 'Hostel Plumbing Contractor (Ramesh)' },
              { value: 'Civil & Carpentry Staff', label: 'Civil & Carpentry Staff (Surendra)' },
              { value: 'Wi-Fi & IT Systems Engineer', label: 'Wi-Fi & IT Systems Engineer' },
              { value: 'Housekeeping Supervisor', label: 'Housekeeping Supervisor' },
              { value: 'Chief Hostel Warden', label: 'Chief Hostel Warden (Self)' },
            ]}
            required
          />

          <Textarea
            label="Assignment Instructions / Notes"
            rows={3}
            placeholder="e.g. Inspect Room 302 fan regulator before 3:00 PM..."
            value={assignRemarks}
            onChange={(e) => setAssignRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Assign Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Resolve Complaint */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Complaint"
        subtitle={`Ticket: ${activeComplaint?.complaintId} - Confirm issue resolution`}
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <Textarea
            label="Resolution Details"
            rows={4}
            placeholder="Explain how the issue was fixed (e.g. replaced flush valve rubber gasket and verified zero leakage)..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              loading={actionLoading}
              icon={CheckCircle2}
            >
              Confirm Resolution
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Reject Complaint */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Complaint"
        subtitle={`Ticket: ${activeComplaint?.complaintId}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 font-semibold">
            Please provide a clear justification. The student will be notified immediately.
          </p>

          <Textarea
            label="Reason for Rejection"
            rows={3}
            placeholder="e.g. Duplicate request already under repair / Personal non-hostel appliance issue..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={actionLoading}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminComplaintsPage;
