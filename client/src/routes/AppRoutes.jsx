import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

// Layout & Protected Route
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard';
import SubmitComplaintPage from '../pages/student/SubmitComplaintPage';
import MyComplaintsPage from '../pages/student/MyComplaintsPage';
import ComplaintDetailsPage from '../pages/student/ComplaintDetailsPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminComplaintsPage from '../pages/admin/AdminComplaintsPage';
import AdminComplaintDetailsPage from '../pages/admin/AdminComplaintDetailsPage';
import ManageStudentsPage from '../pages/admin/ManageStudentsPage';
import ManageCategoriesPage from '../pages/admin/ManageCategoriesPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="submit" element={<SubmitComplaintPage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="complaints/:id" element={<AdminComplaintDetailsPage />} />
        <Route path="students" element={<ManageStudentsPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
