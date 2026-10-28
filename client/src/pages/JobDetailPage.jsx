import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Calendar,
  Globe,
  Mail,
  Shield,
  Layers,
  Target,
  Sparkles,
  XCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/ApplyModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculateJobMatch } from '../utils/matchCriteria';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate, isEmployer } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchJobAndStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.job);
        }

        // If candidate logged in, check saved and applied status
        if (user && isCandidate) {
          try {
            const savedRes = await api.get(`/saved-jobs/check/${id}`);
            if (savedRes.data.success) {
              setIsSaved(savedRes.data.isSaved);
            }
          } catch (e) {
            // non-fatal
          }

          try {
            const appRes = await api.get('/applications/my');
            if (appRes.data.success) {
              const alreadyApplied = appRes.data.applications.some(
                (app) => app.jobId && app.jobId._id === id
              );
              setHasApplied(alreadyApplied);
            }
          } catch (e) {
            // non-fatal
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Job posting not found');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndStatus();
  }, [id, user, isCandidate]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isCandidate) {
      alert('Only candidate accounts can bookmark jobs.');
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/saved-jobs/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange || (!salaryRange.min && !salaryRange.max)) {
      return 'Competitive Salary';
    }
    const currency = salaryRange.currency === 'USD' ? '$' : `${salaryRange.currency} `;
    const period = salaryRange.period === 'yearly' ? '/yr' : salaryRange.period === 'hourly' ? '/hr' : '/mo';

    if (salaryRange.min && salaryRange.max) {
      return `${currency}${salaryRange.min.toLocaleString()} - ${currency}${salaryRange.max.toLocaleString()} ${period}`;
    }
    if (salaryRange.min) {
      return `From ${currency}${salaryRange.min.toLocaleString()} ${period}`;
    }
    return `Up to ${currency}${salaryRange.max.toLocaleString()} ${period}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingSpinner message="Loading job details..." size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-navy-900 mb-2">Job Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'This job posting may have been removed or expired.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  const isJobActive = job.status === 'active';
  const isOwner = user && isEmployer && job.employerId?._id === user._id;

  // Calculate Match Criteria
  const matchData = calculateJobMatch(user, job);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>
      </div>

      {/* Inactive Job Alert if not active */}
      {!isJobActive && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            <strong>Notice:</strong> This job posting is currently <strong>{job.status}</strong> and is not accepting new applications.
          </span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {job.company ? job.company.charAt(0) : 'J'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                  {job.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {job.jobType}
                </span>
                {job.status === 'active' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Actively Hiring
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 uppercase">
                    {job.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 leading-snug">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 mt-2.5">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors relative"
              title="Share Job"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-navy-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isSaved
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600 text-brand-600' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {isOwner ? (
              <Link
                to={`/employer/dashboard?tab=edit&jobId=${job._id}`}
                className="px-5 py-2.5 bg-navy-900 text-white font-semibold rounded-xl text-sm hover:bg-navy-800 transition-colors shadow-sm"
              >
                Edit Job Listing
              </Link>
            ) : hasApplied ? (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold rounded-xl text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Applied</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  if (!isCandidate) {
                    alert('Employers cannot apply for jobs. Please log in as a candidate.');
                    return;
                  }
                  setShowApplyModal(true);
                }}
                disabled={!isJobActive}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 transition-all shadow-md hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Apply Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">Salary</span>
            <span className="text-sm font-bold text-navy-900 mt-0.5 block">{formatSalary(job.salaryRange)}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">Job Type</span>
            <span className="text-sm font-bold text-navy-900 mt-0.5 block">{job.jobType}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">Experience</span>
            <span className="text-sm font-bold text-navy-900 mt-0.5 block">{job.experience}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-slate-600 font-semibold block">Location</span>
            <span className="text-sm font-bold text-navy-900 mt-0.5 block">{job.location}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Details vs Employer Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Match Criteria Scorecard, Description, Responsibilities, Qualifications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* JOB MATCH CRITERIA SCORECARD CARD */}
          {isCandidate && user && (
            <div className="bg-white rounded-2xl border border-brand-200/80 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-navy-900">Your Job Match Criteria</h2>
                    <p className="text-xs text-slate-500">Evaluated against your candidate profile skills and experience</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-navy-900">{matchData.score}%</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    matchData.score >= 75 ? 'bg-emerald-100 text-emerald-800' :
                    matchData.score >= 50 ? 'bg-sky-100 text-sky-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {matchData.level}
                  </span>
                </div>
              </div>

              {/* Match Criteria Progress Bar */}
              <div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      matchData.score >= 75 ? 'bg-emerald-500' :
                      matchData.score >= 50 ? 'bg-sky-500' : 'bg-amber-500'
                    } transition-all duration-500`}
                    style={{ width: `${matchData.score}%` }}
                  />
                </div>
              </div>

              {/* Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                {/* 1. Skills Match */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Technical Skills ({matchData.criteria.skills.score}/45)</span>
                    </span>
                    <span className="text-slate-500 font-normal">
                      {matchData.criteria.skills.matched.length} of {matchData.criteria.skills.total}
                    </span>
                  </div>
                  {matchData.criteria.skills.matched.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {matchData.criteria.skills.matched.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {matchData.criteria.skills.missing.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {matchData.criteria.skills.missing.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px]">
                          + {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Experience Match */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                      <span>Experience Level ({matchData.criteria.experience.score}/25)</span>
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      matchData.criteria.experience.isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {matchData.criteria.experience.isMatch ? 'Match' : 'Check Level'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Requires <strong>{matchData.criteria.experience.requiredLevel}</strong>. {matchData.criteria.experience.status}
                  </p>
                </div>

                {/* 3. Location Match */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>Work Location ({matchData.criteria.location.score}/20)</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {matchData.criteria.location.isRemote ? 'Remote OK' : 'On-Site'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {matchData.criteria.location.status}
                  </p>
                </div>

                {/* 4. Industry Alignment */}
                <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-600" />
                      <span>Industry Alignment ({matchData.criteria.category.score}/10)</span>
                    </span>
                    <span className="text-brand-700 text-[11px] font-semibold">
                      {matchData.criteria.category.jobCategory}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {matchData.criteria.category.status}
                  </p>
                </div>
              </div>

              {/* Profile improvement link */}
              <div className="pt-2 flex items-center justify-between text-xs text-brand-800">
                <span>Want to boost this match? Add missing skills in your candidate profile.</span>
                <Link
                  to="/candidate/dashboard?tab=profile"
                  className="font-bold underline hover:text-brand-900 inline-flex items-center gap-1"
                >
                  <span>Edit Profile Skills</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* About the Role */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              <span>Job Overview & Description</span>
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>Responsibilities</span>
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications & Requirements */}
          {job.qualifications && job.qualifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-600" />
                <span>Qualifications & Skills Needed</span>
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {job.qualifications.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Tags with match indication */}
          {job.skills && job.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-navy-900">
                Required Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => {
                  const isMatched =
                    isCandidate &&
                    (user?.profile?.skills || []).some(
                      (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
                    );
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {isMatched && <span className="text-emerald-600">✓</span>}
                      <span>{skill}</span>
                      {isMatched && <span className="text-[10px] text-emerald-600 font-bold">(Matched)</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Employer Profile & Security Note */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-navy-900 text-base">About the Employer</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-lg">
                {job.company ? job.company.charAt(0) : 'C'}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{job.company}</h4>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
            </div>

            {job.employerId?.profile?.bio && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.employerId.profile.bio}
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              {job.employerId?.profile?.companyWebsite && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600 shrink-0" />
                  <a
                    href={job.employerId.profile.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-600 hover:underline truncate"
                  >
                    {job.employerId.profile.companyWebsite}
                  </a>
                </div>
              )}
              {job.employerId?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">{job.employerId.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Job seeker safety tip */}
          <div className="bg-brand-50/70 border border-brand-200/60 rounded-2xl p-5 text-xs text-brand-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-brand-800">
              <Shield className="w-4 h-4 text-brand-600" />
              <span>JobConnect Verified Posting</span>
            </div>
            <p className="text-brand-700 leading-relaxed">
              JobConnect verifies all employer listings. Never send payments or sensitive financial information during your application process.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onAppliedSuccess={() => {
            setHasApplied(true);
          }}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
