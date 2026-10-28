import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building,
  DollarSign,
  Clock,
  Bookmark,
  Briefcase,
  ChevronRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { calculateJobMatch } from '../utils/matchCriteria';
import MatchCriteriaModal from './MatchCriteriaModal';

const JobCard = ({ job, isSavedInitial = false, onSaveToggle }) => {
  const { user, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Calculate Job Match Criteria
  const matchData = calculateJobMatch(user, job);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!isCandidate) {
      alert('Only candidates can save jobs to their dashboard.');
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        await api.delete(`/saved-jobs/${job._id}`);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(job._id, false);
      } else {
        await api.post(`/saved-jobs/${job._id}`);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(job._id, true);
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
    } finally {
      setSaving(false);
    }
  };

  const getMatchBadgeStyle = (score) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
    if (score >= 50) return 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100';
    if (score >= 30) return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100';
    return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
  };

  return (
    <>
      <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-400 hover:shadow-md transition-all duration-200 relative flex flex-col justify-between">
        <div>
          {/* Header row: Company, Match Criteria Badge & Bookmark */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-navy-900 font-bold text-lg shrink-0 group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-700 transition-colors">
                {job.company ? job.company.charAt(0) : 'J'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors text-base line-clamp-1">
                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{job.company}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Job Match Criteria Pill Button */}
              {isCandidate && matchData.score !== null && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMatchModal(true);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${getMatchBadgeStyle(
                    matchData.score
                  )}`}
                  title="Click to view detailed Job Match Criteria breakdown"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{matchData.score}% Match</span>
                </button>
              )}

              <button
                onClick={handleBookmarkClick}
                disabled={saving}
                className={`p-2 rounded-lg transition-colors shrink-0 ${
                  isSaved
                    ? 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isSaved ? 'Remove from saved jobs' : 'Save job'}
                aria-label="Save Job"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Badges / Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              {job.jobType}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              {job.experience}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200/60">
              {job.category}
            </span>
          </div>

          {/* Short description preview */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>

          {/* Skills Pills with match highlighting */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 4).map((skill, idx) => {
                const isMatched =
                  isCandidate &&
                  (user?.profile?.skills || []).some(
                    (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
                  );
                return (
                  <span
                    key={idx}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                      isMatched
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isMatched && <span className="text-emerald-600 text-[10px]">✓</span>}
                    {skill}
                  </span>
                );
              })}
              {job.skills.length > 4 && (
                <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer row: Salary & Action button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-900 block text-sm">
              {formatSalary(job.salaryRange)}
            </span>
            <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-600" />
              <span>Posted {formatDate(job.createdAt)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 group-hover:bg-brand-600 group-hover:text-white text-slate-700 font-semibold rounded-lg transition-colors text-xs"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Match Criteria Modal */}
      {showMatchModal && (
        <MatchCriteriaModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          matchData={matchData}
          job={job}
          candidate={user}
        />
      )}
    </>
  );
};

export default JobCard;
