import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Building,
  Phone,
  Mail,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  Shield,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllStudents({
        search,
        hostel: hostelFilter,
        page,
        limit: 10,
      });

      if (res.success) {
        setStudents(res.students || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, [search, hostelFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const viewStudentDetails = async (studentId) => {
    try {
      setIsModalOpen(true);
      setStudentDetailsLoading(true);
      const res = await adminService.getStudentDetails(studentId);
      if (res.success) {
        setSelectedStudent(res.student);
        setStudentComplaints(res.complaints || []);
        setStudentStats(res.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Manage Registered Students
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Directory of resident students across all campus hostel halls
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by student name, roll number, email, room..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={Search}
            />
          </div>

          <div>
            <Select
              value={hostelFilter}
              onChange={(e) => {
                setHostelFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Hostels' },
                { value: 'Aryabhatta Hall', label: 'Aryabhatta Hall' },
                { value: 'Gargi Bhavan', label: 'Gargi Bhavan' },
                { value: 'Varanasi Hostel', label: 'Varanasi Hostel' },
                { value: 'Kalam Hall', label: 'Kalam Hall' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching student directory..." />
        ) : students.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No students found"
              description="No registered students match your current search criteria."
              actionText="Clear Filters"
              onAction={() => {
                setSearch('');
                setHostelFilter('all');
                setPage(1);
              }}
            />
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Student Info</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Hostel & Room</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Complaints Submitted</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[11px] text-slate-400">{s.gender}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600">
                        {s.studentId}
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-slate-700">
                        <span className="font-semibold block">{s.hostel || 'Hostel'}</span>
                        <span className="text-slate-400">
                          {s.block || 'Block'} • Room {s.roomNumber || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5 truncate max-w-[160px]">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{s.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{s.phone}</span>
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                            {s.complaintStats?.total || 0} Total
                          </span>
                          {(s.complaintStats?.pending || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                              {s.complaintStats.pending} pending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => viewStudentDetails(s._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile & History</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={10}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Student Details & Complaints History Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Student Profile & Grievance History"
        subtitle={selectedStudent?.name ? `${selectedStudent.name} (${selectedStudent.studentId})` : ''}
        maxWidth="max-w-2xl"
      >
        {studentDetailsLoading ? (
          <LoadingSpinner text="Fetching student profile & history..." />
        ) : selectedStudent ? (
          <div className="space-y-6">
            {/* Student Basic Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-800">{selectedStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Student ID</span>
                <span className="font-mono font-bold text-indigo-600">{selectedStudent.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Hostel Room</span>
                <span className="font-bold text-slate-800">
                  {selectedStudent.hostel} • Rm {selectedStudent.roomNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-medium text-slate-700 truncate block">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-medium text-slate-700">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Registered On</span>
                <span className="font-medium text-slate-700">
                  {new Date(selectedStudent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            {studentStats && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="font-bold text-indigo-900 text-base">{studentStats.total}</p>
                  <p className="text-indigo-600 text-[11px]">Total</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="font-bold text-amber-900 text-base">{studentStats.pending}</p>
                  <p className="text-amber-600 text-[11px]">Pending</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="font-bold text-blue-900 text-base">{studentStats.inProgress}</p>
                  <p className="text-blue-600 text-[11px]">In Progress</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="font-bold text-emerald-900 text-base">{studentStats.resolved}</p>
                  <p className="text-emerald-600 text-[11px]">Resolved</p>
                </div>
              </div>
            )}

            {/* Complaints History List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Complaint History ({studentComplaints.length})
              </h4>

              {studentComplaints.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No complaints registered by this student.</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {studentComplaints.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[11px] font-bold text-indigo-600">
                            {c.complaintId}
                          </span>
                          <StatusBadge status={c.status} size="sm" />
                          <PriorityBadge priority={c.priority} size="sm" />
                        </div>
                        <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Link
                        to={`/admin/complaints/${c._id}`}
                        onClick={() => setIsModalOpen(false)}
                        className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageStudentsPage;
