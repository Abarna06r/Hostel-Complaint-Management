import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  KeyRound,
  Shield,
  Building,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';

export const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    hostel: user?.hostel || 'Central Warden Office',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      if (res.success && res.user) {
        updateUser(res.user);
        success('Admin profile updated successfully!');
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
      error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword(passwordData);
      if (res.success) {
        success(res.message || 'Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Warden Profile & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage administrative credentials, contact details, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Admin Identity Badge */}
        <div className="md:col-span-1">
          <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl border border-slate-800">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-purple-300 font-semibold mt-0.5">
              Hostel Chief Warden
            </p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/60 text-xs font-semibold">
              Root Administrator
            </span>

            <div className="mt-6 pt-5 border-t border-slate-800 text-left text-xs space-y-2.5 text-slate-400">
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-semibold text-slate-200">System Warden</span>
              </div>
              <div className="flex justify-between">
                <span>Hostel Wing:</span>
                <span className="font-semibold text-slate-200">{user?.hostel || 'Central'}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Scope:</span>
                <span className="font-semibold text-emerald-400">All Campuses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Warden Contact Details
              </h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
                <Input
                  label="Office Hotline Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Office Location / Hostel Desk"
                value={profileData.hostel}
                onChange={(e) => setProfileData({ ...profileData, hostel: e.target.value })}
                required
              />

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

          {/* Change Password */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Change Admin Password
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
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
                  Update Admin Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
