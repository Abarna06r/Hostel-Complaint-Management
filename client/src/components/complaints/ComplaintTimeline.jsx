import React from 'react';
import {
  FileText,
  UserCheck,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export const ComplaintTimeline = ({ complaint }) => {
  if (!complaint) return null;

  const { status, timeline = [], createdAt, resolvedAt, rejectionReason } = complaint;

  const isRejected = status === 'Rejected';

  // Standard steps
  const steps = [
    { key: 'Pending', label: 'Submitted', icon: FileText, desc: 'Complaint registered by student' },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck, desc: 'Assigned to warden or maintenance staff' },
    { key: 'In Progress', label: 'In Progress', icon: RotateCw, desc: 'Work under investigation / active repair' },
    { key: 'Resolved', label: 'Resolved', icon: CheckCircle2, desc: 'Issue resolved & verified' },
  ];

  // Helper to determine step index
  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
        return 3;
      case 'Rejected':
        return 1; // branching
      default:
        return 0;
    }
  };

  const currentIdx = getStatusIndex(status);

  // Find timeline events matching step
  const getEventForStatus = (stepKey) => {
    return timeline.find((t) => t.status === stepKey);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center justify-between">
        <span>Resolution Progress Timeline</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Status: {status}
        </span>
      </h3>

      {isRejected ? (
        // Special display for Rejected status
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="w-0.5 h-14 bg-rose-200 my-1"></div>
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Submitted</h4>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(createdAt)}</p>
                <p className="text-xs text-slate-600 mt-1">Complaint registered in system.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-600">Complaint Rejected</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(complaint.updatedAt)}
                </p>
                <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <span className="font-semibold">Reason: </span>
                  {rejectionReason || 'Complaint does not meet criteria or is duplicated.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Standard progressive stepper
        <div className="relative">
          {/* Desktop & Tablet horizontal tracker */}
          <div className="hidden md:grid grid-cols-4 gap-2 relative mb-8">
            {/* Connecting line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${(Math.min(currentIdx, 3) / 3) * 100}%`,
                }}
              />
            </div>

            {steps.map((step, idx) => {
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const StepIcon = step.icon;
              const event = getEventForStatus(step.key);

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative z-10 px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-4 ring-indigo-50'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    <StepIcon className={`w-4 h-4 ${isCurrent && status === 'In Progress' ? 'animate-spin' : ''}`} />
                  </div>
                  <h4
                    className={`text-xs font-bold mt-3 ${
                      isCompleted ? 'text-indigo-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[140px] leading-tight">
                    {step.desc}
                  </p>
                  {event?.timestamp && (
                    <span className="text-[10px] text-indigo-600 font-medium mt-1">
                      {formatDate(event.timestamp)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vertical detailed list of timeline events */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Detailed Activity Log
            </h4>
            <div className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400">No activity logged yet.</p>
              ) : (
                timeline.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-800">
                          {item.status} - <span className="font-normal text-slate-600">{item.updatedByName || 'Admin'}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.remarks}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTimeline;
