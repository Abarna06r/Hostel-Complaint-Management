import React from 'react';
import {
  Clock,
  UserCheck,
  RotateCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const configs = {
    Pending: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Pending',
    },
    Assigned: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: UserCheck,
      label: 'Assigned',
    },
    'In Progress': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: RotateCw,
      label: 'In Progress',
    },
    Resolved: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Resolved',
    },
    Rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = configs[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle,
    label: status,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'In Progress' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const configs = {
    Low: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: ArrowDown,
      label: 'Low',
    },
    Medium: {
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: ArrowUp,
      label: 'Medium',
    },
    High: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: AlertCircle,
      label: 'High',
    },
    Urgent: {
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: Flame,
      label: 'Urgent',
    },
  };

  const config = configs[priority] || configs.Medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${config.bg} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
