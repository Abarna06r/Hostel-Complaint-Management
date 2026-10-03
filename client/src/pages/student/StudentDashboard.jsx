import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import complaintService from '../../services/complaintService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getMyComplaints({ limit: 5 });
        if (res.success) {
          setStats(res.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
          setRecentComplaints(res.complaints || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'In Progress / Assigned',
      value: stats.inProgress,
      icon: RotateCw,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-100',
    },
    {
      title: 'Resolved Issues',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading student dashboard metrics..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resident Student Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Student'}!
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-xl">
            {user?.hostel || 'Hostel'} • {user?.block || 'Block'} • Room {user?.roomNumber || 'N/A'}. Track maintenance requests or register a new grievance below.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link to="/student/submit">
            <Button
              variant="secondary"
              className="bg-white text-indigo-950 hover:bg-slate-100 font-bold px-5 py-3 shadow-md"
              icon={Plus}
            >
              Submit New Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl bg-white border ${card.bg} shadow-sm transition hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 truncate max-w-[110px]">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-white ${card.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${card.color}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Your latest submitted maintenance requests
            </p>
          </div>
          <Link
            to="/student/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>View All Complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="No complaints submitted yet"
              description="You currently have no active or historical complaints recorded for your hostel room."
              actionText="Submit Your First Complaint"
              actionIcon={Plus}
              onAction={() => (window.location.href = '/student/submit')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Complaint ID</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs font-bold text-indigo-600">
                      {c.complaintId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 max-w-xs truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">
                        {c.location}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        to={`/student/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
