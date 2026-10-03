import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  Hash,
  AlertCircle,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    gender: 'Male',
    hostel: 'Aryabhatta Hall',
    block: 'A Block',
    roomNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend Validations
    if (!formData.name.trim()) return setErrorMsg('Please enter your full name');
    if (!formData.studentId.trim()) return setErrorMsg('Please enter your Student ID (Roll Number)');
    if (!formData.email.trim()) return setErrorMsg('Please enter a valid email address');
    if (!formData.phone.trim()) return setErrorMsg('Please enter your phone number');
    if (!formData.roomNumber.trim()) return setErrorMsg('Please specify your room number');
    if (formData.password.length < 6) return setErrorMsg('Password must be at least 6 characters long');
    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await register(formData);
      success(res.message || 'Registration successful! Welcome to HostelCare.');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please check the provided information.';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Register with your hostel room details to submit and track maintenance requests
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name and Student ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />
              <Input
                label="Student ID / Roll No."
                name="studentId"
                placeholder="e.g. STU2024045"
                value={formData.studentId}
                onChange={handleChange}
                icon={Hash}
                required
              />
            </div>

            {/* Row 2: Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
                required
              />
            </div>

            {/* Row 3: Gender, Hostel, Block, Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                required
              />
              <Select
                label="Hostel Name"
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                options={[
                  { value: 'Aryabhatta Hall', label: 'Aryabhatta Hall (Boys)' },
                  { value: 'Gargi Bhavan', label: 'Gargi Bhavan (Girls)' },
                  { value: 'Varanasi Hostel', label: 'Varanasi Hostel (PG)' },
                  { value: 'Kalam Hall', label: 'Kalam Hall (Engineering)' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Block / Wing"
                name="block"
                placeholder="e.g. B Block"
                value={formData.block}
                onChange={handleChange}
                icon={Home}
                required
              />
              <Input
                label="Room Number"
                name="roomNumber"
                placeholder="e.g. 302"
                value={formData.roomNumber}
                onChange={handleChange}
                icon={Home}
                required
              />
            </div>

            {/* Row 4: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                required
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={loading}
                icon={UserPlus}
              >
                Create Student Account & Enter Portal
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
