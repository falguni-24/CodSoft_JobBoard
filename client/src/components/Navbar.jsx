import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Search,
  Building2,
  Bookmark,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isEmployer, isCandidate } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-brand-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-navy-900">
                  Job<span className="text-brand-600">Connect</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 -mt-1">
                  Career Portal
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/jobs')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Find Jobs</span>
              </Link>
              <Link
                to="/companies"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/companies')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Companies</span>
              </Link>
            </div>
          </div>

          {/* Desktop Right CTA / User controls */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {isEmployer ? (
                  <>
                    <Link
                      to="/employer/dashboard?tab=post-job"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post a Job</span>
                    </Link>
                    <Link
                      to="/employer/dashboard"
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        location.pathname.startsWith('/employer')
                          ? 'bg-navy-900 text-white border-navy-900'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Employer Dashboard</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/candidate/dashboard?tab=saved"
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Saved Jobs"
                    >
                      <Bookmark className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/candidate/dashboard"
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        location.pathname.startsWith('/candidate')
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Candidate Dashboard</span>
                    </Link>
                  </>
                )}

                {/* Profile Pill */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-navy-900 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-600 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all hover:shadow"
                >
                  <User className="w-4 h-4" />
                  <span>Register</span>
                </Link>
                <Link
                  to="/register?role=employer"
                  className="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2 text-sm font-medium text-navy-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span>For Employers</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Companies
          </Link>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-lg flex items-center space-x-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy-900">{user.name}</div>
                    <div className="text-xs text-slate-600 capitalize">{user.role} &bull; {user.email}</div>
                  </div>
                </div>

                {isEmployer ? (
                  <>
                    <Link
                      to="/employer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 px-4 rounded-lg bg-navy-900 text-white font-medium text-sm"
                    >
                      Employer Dashboard
                    </Link>
                    <Link
                      to="/employer/dashboard?tab=post-job"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-sm"
                    >
                      + Post a New Job
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/candidate/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium text-sm"
                  >
                    Candidate Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-sm border border-rose-200 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-lg border border-slate-300 font-medium text-sm text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 px-4 rounded-lg bg-brand-600 text-white font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
