import React from 'react';
import { Menu, Plus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ onOpenSidebar, pageTitle = 'Dashboard' }) => {
  const { user, role } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Actions, Notifications, Profile Link */}
      <div className="flex items-center gap-3">
        {/* Student Quick Action: Submit Complaint */}
        {role === 'student' && (
          <Link
            to="/student/submit"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Complaint</span>
          </Link>
        )}

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Avatar / Profile link */}
        <Link
          to={role === 'admin' ? '/admin/profile' : '/student/profile'}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
            {user?.name || 'Account'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
