import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to derive a clean page title from path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/student/dashboard')) return 'Student Dashboard';
    if (pathname.includes('/student/submit')) return 'Submit New Complaint';
    if (pathname.includes('/student/complaints')) return 'My Complaints';
    if (pathname.includes('/student/profile')) return 'My Profile & Settings';
    if (pathname.includes('/admin/dashboard')) return 'Admin Overview';
    if (pathname.includes('/admin/complaints')) return 'Hostel Complaints Directory';
    if (pathname.includes('/admin/students')) return 'Registered Students';
    if (pathname.includes('/admin/categories')) return 'Complaint Categories';
    if (pathname.includes('/admin/profile')) return 'Warden Profile & Security';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
