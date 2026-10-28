import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Code2,
  Database,
  Palette,
  TrendingUp,
  Coins,
  Layers,
  Headphones,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

const categories = [
  { name: 'Software Development', icon: Code2, count: '140+ jobs', color: 'from-blue-500 to-indigo-600' },
  { name: 'Data Science', icon: Database, count: '65+ jobs', color: 'from-cyan-500 to-blue-600' },
  { name: 'Design', icon: Palette, count: '45+ jobs', color: 'from-purple-500 to-pink-600' },
  { name: 'Marketing', icon: TrendingUp, count: '50+ jobs', color: 'from-emerald-500 to-teal-600' },
  { name: 'Finance', icon: Coins, count: '35+ jobs', color: 'from-amber-500 to-orange-600' },
  { name: 'Product Management', icon: Layers, count: '40+ jobs', color: 'from-rose-500 to-red-600' },
  { name: 'Customer Support', icon: Headphones, count: '30+ jobs', color: 'from-sky-500 to-cyan-600' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs?limit=6&sort=newest');
        if (res.data.success) {
          setRecentJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load recent jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('search', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold mb-6 tracking-wide">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span>Over 1,200+ Verified Tech & Enterprise Roles</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-200">Dream Job</span> Today
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Connect directly with verified employers hiring worldwide. Search by title, skills, or location, and apply in seconds.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-3 text-slate-800"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full focus:outline-none text-sm text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-3 py-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full focus:outline-none text-sm text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </button>
          </form>

          {/* Quick tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Popular searches:</span>
            {['React', 'Remote', 'Node.js', 'Python', 'Product Designer', 'Data Science'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setKeyword(tag);
                  navigate(`/jobs?search=${encodeURIComponent(tag)}`);
                }}
                className="hover:text-white hover:underline transition-colors bg-white/5 px-2.5 py-1 rounded-md"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900">2,500+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Active Job Listings</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-600">800+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verified Companies</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900">15,000+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Active Candidates</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600">98%</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Successful Matches</div>
          </div>
        </div>
      </section>

      {/* Browse By Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Explore by Industry
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1">
              Popular Job Categories
            </h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-2 sm:mt-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="w-11 h-11 rounded-lg bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-700 group-hover:text-brand-600 mb-4 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured / Recent Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Fresh Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1">
              Featured & Recently Posted Jobs
            </h2>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-2 sm:mt-0"
          >
            <span>Browse All {recentJobs.length > 0 ? recentJobs.length : ''} Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading fresh job opportunities..." />
        ) : recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No jobs posted yet</h3>
            <p className="text-slate-500 text-sm mt-1">Run the database seed script to populate demo jobs.</p>
          </div>
        )}
      </section>

      {/* Dual CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidate CTA */}
          <div className="bg-gradient-to-br from-brand-900 to-navy-900 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="relative z-10 mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4">
                For Job Seekers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug">
                Land Your Next Career Milestone
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Build your professional profile, upload your resume once, and apply to top companies with one click.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Personalized job recommendations and saved jobs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Real-time email alerts when employers review your status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Completely free for job seekers</span>
                </li>
              </ul>
            </div>
            <div className="relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
              >
                <span>Create Candidate Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Employer CTA */}
          <div className="bg-gradient-to-br from-slate-900 to-navy-950 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl border border-slate-800">
            <div className="relative z-10 mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
                For Employers & Recruiters
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug">
                Hire World-Class Talent Faster
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Publish job openings, screen candidates, download resumes, and manage applicant statuses from one unified employer dashboard.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reach qualified candidates across all experience levels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full applicant tracking system with status pipelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant email alerts when candidates apply</span>
                </li>
              </ul>
            </div>
            <div className="relative z-10">
              <Link
                to="/register?role=employer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
              >
                <span>Start Hiring Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
