import React from 'react';
import {
  X,
  Target,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MatchCriteriaModal = ({ isOpen, onClose, matchData, job, candidate }) => {
  if (!isOpen || !matchData) return null;

  const { score, level, badgeColor, criteria, isGuest } = matchData;

  const getBadgeStyle = () => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (score >= 50) return 'bg-sky-50 text-sky-700 border-sky-300';
    if (score >= 30) return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getProgressColor = () => {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-sky-500';
    if (score >= 30) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close match breakdown"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Target className="w-4 h-4" />
          <span>Job Match Criteria Analysis</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 leading-tight">
          Match Breakdown for {job.title}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {job.company} &bull; {job.location}
        </p>

        {isGuest ? (
          <div className="mt-6 p-6 bg-brand-50 border border-brand-200 rounded-xl text-center">
            <Sparkles className="w-10 h-10 text-brand-600 mx-auto mb-3" />
            <h3 className="font-bold text-navy-900 text-base mb-1">Sign in as a Job Seeker</h3>
            <p className="text-xs text-slate-600 mb-4 max-w-sm mx-auto">
              Create or log in to your candidate account to see personalized match scores, skills gap analysis, and tailored recommendations.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Score Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Overall Match Score
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-navy-900">{score}%</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle()}`}>
                    {level}
                  </span>
                </div>
              </div>

              {/* Visual Meter Bar */}
              <div className="w-32 sm:w-44">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor()} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-600 block text-right mt-1 font-medium">
                  {score >= 75 ? 'Excellent alignment' : score >= 50 ? 'Strong potential' : 'Some gaps identified'}
                </span>
              </div>
            </div>

            {/* Criteria 1: Skills Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>1. Technical Skills Match ({criteria.skills.score} / {criteria.skills.maxScore} pts)</span>
                </span>
                <span className="font-semibold text-slate-600">
                  {criteria.skills.matched.length} of {criteria.skills.total} skills matched
                </span>
              </div>

              {/* Matched Skills */}
              {criteria.skills.matched.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 block mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Skills You Have:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {criteria.skills.matched.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-semibold"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {criteria.skills.missing.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Skills to Learn or Add to Profile:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {criteria.skills.missing.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Criteria 2: Experience Level */}
            <div className="pt-3 border-t border-slate-100 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">
                    2. Experience Level Criteria ({criteria.experience.score} / {criteria.experience.maxScore} pts)
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    Job requires <strong>{criteria.experience.requiredLevel}</strong> &bull; {criteria.experience.status}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                criteria.experience.isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {criteria.experience.isMatch ? 'Matched' : 'Check Level'}
              </span>
            </div>

            {/* Criteria 3: Location / Remote */}
            <div className="pt-3 border-t border-slate-100 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">
                    3. Location & Work Mode ({criteria.location.score} / {criteria.location.maxScore} pts)
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    {criteria.location.status}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 shrink-0">
                {criteria.location.isRemote ? 'Remote OK' : 'On-Site'}
              </span>
            </div>

            {/* Criteria 4: Industry Alignment */}
            <div className="pt-3 border-t border-slate-100 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">
                    4. Category Alignment ({criteria.category.score} / {criteria.category.maxScore} pts)
                  </span>
                  <p className="text-slate-600 mt-0.5">
                    {criteria.category.status}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-700 shrink-0">
                {criteria.category.jobCategory}
              </span>
            </div>

            {/* Recommendation Footnote */}
            <div className="p-3 bg-brand-50/70 border border-brand-200/60 rounded-xl text-xs text-brand-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Update skills in your candidate profile to increase match precision.</span>
              </div>
              <Link
                to="/candidate/dashboard?tab=profile"
                onClick={onClose}
                className="text-brand-700 font-bold hover:underline shrink-0 flex items-center gap-1 text-[11px]"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCriteriaModal;
