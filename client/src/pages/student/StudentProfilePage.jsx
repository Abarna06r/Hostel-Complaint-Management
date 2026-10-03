import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Home,
  Lock,
  Save,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
    hostel: user?.hostel || '',
    block: user?.block || '',
    roomNumber: user?.roomNumber || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      if (res.success && res.user) {
        updateUser(res.user);
        success('Profile updated successfully!');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword(passwordData);
      if (res.success) {
        success(res.message || 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal contact details and security credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-indigo-600 font-semibold mt-0.5">
              {user?.studentId || 'Hostel Resident'}
            </p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              Active Student
            </span>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Hostel:</span>
                <span className="font-semibold text-slate-800">{user?.hostel || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block / Wing:</span>
                <span className="font-semibold text-slate-800">{user?.block || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Room No:</span>
                <span className="font-semibold text-slate-800">{user?.roomNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Change Password Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Student ID (Permanent)"
                  value={user?.studentId || ''}
                  disabled
                  helperText="Student ID cannot be altered once verified"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Hostel Name"
                  name="hostel"
                  value={profileData.hostel}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Block"
                  name="block"
                  value={profileData.block}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Room Number"
                  name="roomNumber"
                  value={profileData.roomNumber}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={savingProfile}
                  icon={Save}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                placeholder="Enter existing password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={savingPassword}
                  icon={Lock}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
