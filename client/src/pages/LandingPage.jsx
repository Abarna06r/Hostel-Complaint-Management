import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Building2,
  ShieldCheck,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  BellRing,
  HelpCircle,
  PhoneCall,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();

  const categories = [
    { name: 'Electrical & Power', icon: Zap, desc: 'Fans, lights, switches, plug points, and MCB tripping' },
    { name: 'Plumbing & Water', icon: Droplets, desc: 'Taps, leakage, bathroom fixtures, and water supply' },
    { name: 'Wi-Fi & Network', icon: Wifi, desc: 'LAN port faults, campus Wi-Fi access, and speed drops' },
    { name: 'Room Maintenance', icon: Wrench, desc: 'Locks, window latches, cupboard hinges, and wall repairs' },
    { name: 'Hygiene & Cleaning', icon: Sparkles, desc: 'Room deep cleaning, corridor sweep, and waste disposal' },
    { name: 'Mess & Drinking Water', icon: UtensilsCrossed, desc: 'RO water purifiers, water coolers, and dining hall issues' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register & Sign In',
      desc: 'Create your student account using your verified student ID, room number, and hostel block.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Submit Complaint',
      desc: 'Select issue category, specify urgency, describe the problem, and attach photos if needed.',
      icon: Clock,
    },
    {
      step: '03',
      title: 'Track Resolution',
      desc: 'Watch real-time status progression from Assigned to In Progress to Verified Resolution.',
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      title: 'Real-Time Status Tracking',
      desc: 'Transparent 4-stage visual timeline keeps you informed on every technician dispatch.',
      icon: Clock,
    },
    {
      title: 'Priority Escalation',
      desc: 'Urgent and High priority issues like water leaks and electrical sparks get prioritized triage.',
      icon: Zap,
    },
    {
      title: 'Warden Admin Desk',
      desc: 'Hostel administrators can assign maintenance personnel, update statuses, and log resolution notes.',
      icon: ShieldCheck,
    },
    {
      title: 'Notification System',
      desc: 'Instant alert feeds for complaint status changes, assignments, and resolution notes.',
      icon: BellRing,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Official Campus Hostel Grievance Redressal Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Hostel Complaint <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A centralized digital platform for hostel residents to register, track, and resolve maintenance issues promptly. Empowering wardens and staff with real-time issue triage.
          </p>

          {/* Call to action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <span>Enter Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <span>Student Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition"
                >
                  Student Registration
                </Link>
                <Link
                  to="/login?role=admin"
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin / Warden Portal</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">24/7</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Complaint Logging</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Status Transparency</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-600">&lt; 24h</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Average Response</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">9+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Maintenance Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How The Complaint System Works
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Submit your maintenance grievance in three effortless steps with end-to-end audit accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 bg-slate-50 rounded-2xl border border-slate-200/80 hover:shadow-md transition group"
                >
                  <span className="text-4xl font-extrabold text-slate-200 group-hover:text-indigo-200 transition">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center my-4 shadow-md shadow-indigo-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Complaint Categories Showcase */}
      <section id="categories" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Maintenance Domains
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Supported Complaint Categories
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              We cover all hostel living facilities so every resident's comfort and hygiene is maintained.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">{cat.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
                Why Use HostelCare
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Transparent Resolution for Students, Powerful Triage for Wardens
              </h3>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Traditional paper registers and manual WhatsApp messages result in lost requests and zero accountability. Our system ensures every issue receives a ticket ID, assigned supervisor, and verifiable resolution.
              </p>

              <div className="mt-8 space-y-4">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual preview card */}
            <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700/80 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-xs">
                    HC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Live Complaint Tracker</p>
                    <p className="text-[10px] text-slate-400">Aryabhatta Hall • Rm 302</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  In Progress
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Issue Title
                  </span>
                  <p className="font-semibold text-slate-200">
                    Ceiling Fan Sparking & Regulator Fault
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">Priority</span>
                    <span className="text-rose-400 font-bold">Urgent</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400 block text-[10px]">Assigned To</span>
                    <span className="text-indigo-300 font-bold">Chief Hostel Warden</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-[11px] text-indigo-200">
                  <span className="font-bold">Latest Note: </span>
                  Electrician dispatched with replacement coil. Verification scheduled by 4:00 PM.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Help Section */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
              Assistance
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hostel Warden Helpdesk
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              For emergency complaints or physical verification, reach out to the hostel administration office.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Office Location</h4>
              <p className="text-xs text-slate-500 mt-1">
                Central Hostel Administrative Wing, Ground Floor, Room W-01
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Emergency Hotline</h4>
              <p className="text-xs text-slate-500 mt-1">
                +91 9876543210 / Ext 402 (24/7 Security Desk)
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Official Email</h4>
              <p className="text-xs text-slate-500 mt-1">
                warden@hostel.edu.in / admin@hostel.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-white">HostelCare Management System</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Campus Hostel Authority. Built for Academic Project Viva & Production Deployment.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <Link to="/login?role=admin" className="text-indigo-400 hover:text-indigo-300 transition">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
