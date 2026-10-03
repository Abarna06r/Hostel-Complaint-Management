import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  LogIn,
  Mail,
  Lock,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter both Email/Student ID and Password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier.trim(), password);
      success(res.message || 'Login successful!');

      if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid credentials. Please verify your details.';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Viva Autofill Helpers
  const fillStudentDemo = () => {
    setSelectedRole('student');
    setIdentifier('rahul.sharma@hostel.com');
    setPassword('Student@123');
    setErrorMsg('');
  };

  const fillAdminDemo = () => {
    setSelectedRole('admin');
    setIdentifier('admin@hostel.com');
    setPassword('Admin@123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Building2 className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to HostelCare
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Sign in to access your complaint management portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200">
          {/* Role selector tab */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                selectedRole === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${
                selectedRole === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Warden / Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={selectedRole === 'admin' ? 'Admin Email / Username' : 'Email or Student ID'}
              placeholder={
                selectedRole === 'admin'
                  ? 'admin@hostel.com'
                  : 'e.g. rahul.sharma@hostel.com or STU2024001'
              }
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant={selectedRole === 'admin' ? 'primary' : 'primary'}
                className="w-full py-2.5"
                loading={loading}
                icon={LogIn}
              >
                Sign In to {selectedRole === 'admin' ? 'Warden Desk' : 'Student Portal'}
              </Button>
            </div>
          </form>

          {/* Quick Demo Fill Buttons for Viva / Testing */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Viva Demo Fill:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={fillStudentDemo}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition text-[11px] font-semibold text-left"
              >
                🎓 Student Demo
              </button>
              <button
                type="button"
                onClick={fillAdminDemo}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition text-[11px] font-semibold text-left"
              >
                🛡️ Warden Demo
              </button>
            </div>
          </div>

          {/* Footer link to register */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have a student account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
