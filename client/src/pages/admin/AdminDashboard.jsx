import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  UserCheck,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Users,
  Building,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading Warden administration metrics..." />;
  }

  const { stats, categoryStats = [], hostelStats = [], recentComplaints = [], criticalComplaints = [] } = data || {};

  const statCards = [
    { label: 'Total Complaints', value: stats?.total || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Pending Triage', value: stats?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Assigned', value: stats?.assigned || 0, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: RotateCw, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { label: 'Resolved Issues', value: stats?.resolved || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-purple-300 text-xs font-bold mb-3 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hostel Administration Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chief Warden Overview
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
            Real-time monitoring across all campus hostels. {stats?.students || 0} registered students under management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/complaints">
            <Button variant="primary" icon={FileText} className="font-bold shadow-md">
              Manage All Complaints
            </Button>
          </Link>
          <Link to="/admin/students">
            <Button variant="outline" className="text-white border-slate-700 bg-slate-800 hover:bg-slate-700" icon={Users}>
              Students Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-4 rounded-2xl bg-white border ${card.bg} shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${card.color}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Critical & Urgent Alerts Banner */}
      {(stats?.urgentUnresolved > 0 || stats?.highUnresolved > 0) && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">
                Action Required: {stats.urgentUnresolved} Urgent & {stats.highUnresolved} High Priority Complaints Active
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                These grievances require immediate maintenance dispatch to prevent safety or water damage.
              </p>
            </div>
          </div>
          <Link to="/admin/complaints?priority=Urgent">
            <Button variant="danger" size="sm">
              Review Urgent Issues
            </Button>
          </Link>
        </div>
      )}

      {/* Grid: Category Breakdown & Critical Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution with Visual Progress Bars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Complaints by Category
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of issues reported across campus
              </p>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-slate-400">No complaint data recorded yet.</p>
            ) : (
              categoryStats.map((cat) => {
                const total = stats?.total || 1;
                const percentage = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat._id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat._id}</span>
                      <span className="text-slate-500">
                        <strong className="text-slate-900">{cat.count}</strong> ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Urgent & High Priority Attention List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                High Attention Queue
              </h3>
              <p className="text-xs text-slate-500">Urgent & High priority unresolved tickets</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              {criticalComplaints.length} tickets
            </span>
          </div>

          <div className="space-y-3">
            {criticalComplaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">All Clear!</p>
                <p className="text-slate-400 mt-0.5">No unresolved urgent or high priority issues.</p>
              </div>
            ) : (
              criticalComplaints.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={c.priority} size="sm" />
                      <span className="font-mono text-[11px] font-bold text-indigo-600">
                        {c.complaintId}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {c.hostel} • Room {c.roomNumber} ({c.submittedBy?.name || 'Student'})
                    </p>
                  </div>
                  <Link
                    to={`/admin/complaints`}
                    className="flex-shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-white"
                  >
                    Action
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Grievances</h3>
            <p className="text-xs text-slate-500">Latest tickets submitted across all halls</p>
          </div>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <span>All Complaints Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">ID & Student</th>
                <th className="py-3.5 px-4">Title & Hostel</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6">
                    <span className="font-mono text-xs font-bold text-indigo-600 block">
                      {c.complaintId}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[130px]">
                      {c.submittedBy?.name || 'Student'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 truncate max-w-xs">{c.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {c.hostel} • Room {c.roomNumber}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {c.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                    {c.assignedTo?.name || (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to={`/admin/complaints`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>Triage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
