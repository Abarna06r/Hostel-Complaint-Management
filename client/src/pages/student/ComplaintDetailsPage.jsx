import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  User,
  Shield,
  Clock,
  Edit3,
  Trash2,
  FileImage,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import complaintService from '../../services/complaintService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setEditFormData({
          title: res.complaint.title,
          description: res.complaint.description,
          category: res.complaint.category,
          location: res.complaint.location,
          priority: res.complaint.priority,
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Complaint not found');
      navigate('/student/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await complaintService.updateComplaint(complaint._id, editFormData);
      if (res.success) {
        success('Complaint updated successfully!');
        setComplaint(res.complaint);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const res = await complaintService.deleteComplaint(complaint._id);
      if (res.success) {
        success('Complaint cancelled and deleted.');
        navigate('/student/complaints');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to cancel complaint');
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading complaint details..." />;
  }

  if (!complaint) return null;

  const isPending = complaint.status === 'Pending';

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Details
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Cancel Complaint
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header with ID and Badges */}
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
            <p>Submitted on</p>
            <p className="font-semibold text-slate-700 mt-0.5">
              {new Date(complaint.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Location & Room Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Hostel</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              {complaint.hostel}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Block / Room</span>
            <span className="font-bold text-slate-800">
              {complaint.block} • Room {complaint.roomNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Specific Location</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {complaint.location}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Category</span>
            <span className="font-bold text-slate-800">{complaint.category}</span>
          </div>
        </div>

        {/* Description */}
        <div className="py-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Problem Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {complaint.description}
          </p>
        </div>

        {/* Image Attachments (if any) */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="py-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Photo Attachment
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
                    alt={att.filename || 'Attachment'}
                    className="w-48 h-36 object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    <span>View Full Image</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Staff & Admin Assigned Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4 text-indigo-600" />
              Assigned Personnel
            </span>
            <p className="text-slate-700 font-semibold mt-1">
              {complaint.assignedTo?.name || 'Awaiting Warden Assignment'}
            </p>
            {complaint.assignedTo?.assignedAt && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Assigned on {new Date(complaint.assignedTo.assignedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              Warden Remarks
            </span>
            <p className="text-slate-600 mt-1 italic">
              {complaint.adminRemarks || 'No supervisor remarks added yet.'}
            </p>
          </div>
        </div>

        {/* Resolution Box if Resolved */}
        {complaint.status === 'Resolved' && complaint.resolution?.notes && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Issue Resolved</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              {complaint.resolution.notes}
            </p>
            {complaint.resolvedAt && (
              <p className="text-[11px] text-emerald-600 mt-2">
                Resolved on {new Date(complaint.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Progress Stepper & Audit Timeline */}
      <ComplaintTimeline complaint={complaint} />

      {/* Edit Modal (Pending complaints only) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Complaint Details"
        subtitle="You can modify this complaint while its status is still Pending."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />
          <Input
            label="Location"
            value={editFormData.location}
            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            required
          />
          <Select
            label="Priority"
            value={editFormData.priority}
            onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Urgent', label: 'Urgent' },
            ]}
          />
          <Textarea
            label="Description"
            rows={4}
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={savingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel/Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Cancel This Complaint?"
        message="Are you sure you want to cancel and delete this complaint? This cannot be undone."
        confirmText="Yes, Cancel Complaint"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default ComplaintDetailsPage;
