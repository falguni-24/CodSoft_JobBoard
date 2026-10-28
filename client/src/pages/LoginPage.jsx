import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      if (user.role === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate(from === '/' ? '/candidate/dashboard' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'employer') {
      setEmail('employer@jobconnect.demo');
      setPassword('Employer@1234');
    } else {
      setEmail('candidate@jobconnect.demo');
      setPassword('Candidate@1234');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-brand-600 flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-navy-900">
              Job<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log in to manage your jobs or applications
          </p>
        </div>

        {/* Quick Demo Credentials Fill Buttons */}
        <div className="mb-6 p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-brand-900">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Instant Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoFill('candidate')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-brand-300 font-medium text-brand-700 hover:bg-brand-100 transition-colors text-[11px]"
            >
              Demo Candidate
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('employer')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-brand-300 font-medium text-brand-700 hover:bg-brand-100 transition-colors text-[11px]"
            >
              Demo Employer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
