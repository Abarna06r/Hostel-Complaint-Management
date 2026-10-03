import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building,
  MapPin,
  Clock,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  RotateCw,
  UserCheck,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import complaintService from '../../services/complaintService';
import adminService from '../../services/adminService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Campus Maintenance Team');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setNewStatus(res.complaint.status);
        setStatusRemarks(res.complaint.adminRemarks || '');
      }
    } catch (err) {
      error('Failed to load complaint details');
      navigate('/admin/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.updateComplaintStatus(complaint._id, {
        status: newStatus,
        remarks: statusRemarks,
      });
      if (res.success) {
        success(`Status updated to "${newStatus}"!`);
        setComplaint(res.complaint);
        setIsStatusModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await adminService.assignComplaint(complaint._id, {
        assignedUserName: assignedStaff,
        remarks: assignRemarks,
      });
      if (res.success) {
        success(`Assigned to ${assignedStaff}!`);
        setComplaint(res.complaint);
        setIsAssignModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      error('Please write resolution notes');
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.resolveComplaint(complaint._id, {
        resolutionNotes,
      });
      if (res.success) {
        success('Complaint marked as Resolved!');
        setComplaint(res.complaint);
        setIsResolveModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      error('Please provide rejection justification');
      return;
    }
    try {
      setActionLoading(true);
      const res = await adminService.rejectComplaint(complaint._id, {
        rejectionReason,
      });
      if (res.success) {
        success('Complaint marked as Rejected.');
        setComplaint(res.complaint);
        setIsRejectModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reject complaint');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading complaint details..." />;
  }

  if (!complaint) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top back link and Quick Triage Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Directory</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={UserCheck}
            onClick={() => setIsAssignModalOpen(true)}
          >
            Assign Personnel
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={RotateCw}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Update Status
          </Button>

          {complaint.status !== 'Resolved' && (
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsResolveModalOpen(true)}
            >
              Resolve
            </Button>
          )}

          {complaint.status !== 'Rejected' && complaint.status !== 'Resolved' && (
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => setIsRejectModalOpen(true)}
            >
              Reject
            </Button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {complaint.complaintId}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>

          <div className="text-right text-xs text-slate-400">
            <p>Submitted</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Student & Location Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100">
          {/* Submitting Student Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-sm">
              <User className="w-4 h-4 text-indigo-600" />
              Resident Student Details
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-800">{complaint.submittedBy?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID:</span>
              <span className="font-mono font-semibold text-indigo-600">
                {complaint.submittedBy?.studentId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-800">{complaint.submittedBy?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="text-slate-800">{complaint.submittedBy?.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Location & Hostel Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-sm">
              <Building className="w-4 h-4 text-indigo-600" />
              Location & Category
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Hostel Hall:</span>
              <span className="font-bold text-slate-800">{complaint.hostel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Block / Wing:</span>
              <span className="font-bold text-slate-800">{complaint.block}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room Number:</span>
              <span className="font-bold text-slate-800">Room {complaint.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exact Spot:</span>
              <span className="text-slate-800">{complaint.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-bold text-indigo-700">{complaint.category}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="py-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Complaint Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Photo Attachment if present */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="py-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Photo Evidence
            </h3>
            <div className="flex flex-wrap gap-4">
              {complaint.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                >
                  <img
                    src={att.path}
                    alt="Attachment"
                    className="w-48 h-36 object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    <span>View Image</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Warden Remarks & Assignment Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4 text-indigo-600" />
              Assigned Personnel
            </span>
            <p className="text-slate-800 font-bold mt-1 text-sm">
              {complaint.assignedTo?.name || 'Unassigned'}
            </p>
            {complaint.assignedTo?.assignedAt && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Assigned on {new Date(complaint.assignedTo.assignedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              Previous Remarks
            </span>
            <p className="text-slate-600 mt-1 italic">
              {complaint.adminRemarks || 'No supervisor remarks added.'}
            </p>
          </div>
        </div>

        {/* Resolution details if resolved */}
        {complaint.status === 'Resolved' && complaint.resolution?.notes && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Resolution Information</span>
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {complaint.resolution.notes}
            </p>
            {complaint.resolvedAt && (
              <p className="text-[11px] text-emerald-600 mt-2">
                Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Rejection notice if rejected */}
        {complaint.status === 'Rejected' && complaint.rejectionReason && (
          <div className="mt-6 p-5 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1.5">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Complaint Rejected</span>
            </div>
            <p className="text-xs text-rose-950 font-medium leading-relaxed">
              {complaint.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <ComplaintTimeline complaint={complaint} />

      {/* Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Status & Remarks"
        subtitle={`Ticket: ${complaint.complaintId}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="Select New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Resolved', label: 'Resolved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />

          <Textarea
            label="Admin Remarks"
            rows={3}
            placeholder="Notes on current dispatch or progress..."
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
              Save Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Complaint"
        subtitle={`Ticket: ${complaint.complaintId}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Maintenance Technician / Staff"
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
          />

          <Textarea
            label="Instructions for Assignee"
            rows={3}
            placeholder="Add priority instructions for the repair staff..."
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
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Mark as Resolved"
        subtitle={`Ticket: ${complaint.complaintId}`}
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <Textarea
            label="Resolution Summary"
            rows={4}
            placeholder="Detail how the issue was fixed and verified..."
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

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Complaint"
        subtitle={`Ticket: ${complaint.complaintId}`}
      >
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            rows={3}
            placeholder="Explain why this complaint is rejected..."
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

export default AdminComplaintDetailsPage;
