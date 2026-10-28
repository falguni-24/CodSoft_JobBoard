import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Target,
  Sparkles,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { calculateJobMatch } from '../utils/matchCriteria';

const categoriesList = [
  'All',
  'Software Development',
  'Data Science',
  'Design',
  'Marketing',
  'Finance',
  'Product Management',
  'Customer Support',
  'Sales',
  'Other',
];

const jobTypesList = ['All', 'Full-Time', 'Part-Time', 'Contract', 'Remote', 'Internship'];

const experienceList = ['All', 'Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal', 'Executive'];

const matchCriteriaOptions = [
  { value: 'all', label: 'All Jobs', description: 'Show all matching listings' },
  { value: '75', label: '🎯 Strong Match (75%+)', description: 'Best alignment with your profile' },
  { value: '50', label: '👍 Good Match (50%+)', description: 'Strong potential match' },
  { value: 'skills', label: '💼 Has Matching Skills', description: 'At least 1 overlapping skill' },
];

const JobsPage = () => {
  const { user, isCandidate } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'All');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [matchCriteria, setMatchCriteria] = useState(searchParams.get('match') || 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Response state
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fallback closest matching jobs when 0 exact results match
  const [closestMatches, setClosestMatches] = useState([]);
  const [loadingClosest, setLoadingClosest] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
    setCategory(searchParams.get('category') || 'All');
    setJobType(searchParams.get('jobType') || 'All');
    setExperience(searchParams.get('experience') || 'All');
    setMinSalary(searchParams.get('minSalary') || '');
    setSort(searchParams.get('sort') || 'newest');
    setMatchCriteria(searchParams.get('match') || 'all');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch jobs whenever query changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (location) params.append('location', location);
        if (category && category !== 'All') params.append('category', category);
        if (jobType && jobType !== 'All') params.append('jobType', jobType);
        if (experience && experience !== 'All') params.append('experience', experience);
        if (minSalary) params.append('minSalary', minSalary);
        if (sort && sort !== 'match') params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', '9');

        const res = await api.get(`/jobs?${params.toString()}`);
        if (res.data.success) {
          let fetchedJobs = res.data.jobs || [];

          // If sorting or filtering by Job Match Criteria for logged in candidates
          if (isCandidate && user) {
            fetchedJobs = fetchedJobs.map((j) => ({
              ...j,
              _matchData: calculateJobMatch(user, j),
            }));

            // Filter by Match Criteria if selected
            if (matchCriteria === '75') {
              fetchedJobs = fetchedJobs.filter((j) => j._matchData.score >= 75);
            } else if (matchCriteria === '50') {
              fetchedJobs = fetchedJobs.filter((j) => j._matchData.score >= 50);
            } else if (matchCriteria === 'skills') {
              fetchedJobs = fetchedJobs.filter(
                (j) => j._matchData.criteria.skills.matched.length > 0
              );
            }

            // Sort by Best Match if selected
            if (sort === 'match') {
              fetchedJobs.sort((a, b) => (b._matchData?.score || 0) - (a._matchData?.score || 0));
            }
          }

          setJobs(fetchedJobs);
          setTotalJobs(matchCriteria !== 'all' ? fetchedJobs.length : res.data.total);
          setTotalPages(res.data.pages || 1);

          // If 0 exact jobs match, fetch closest matching fallback jobs
          if (fetchedJobs.length === 0 && (category !== 'All' || jobType !== 'All' || search)) {
            fetchClosestMatches();
          } else {
            setClosestMatches([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchClosestMatches = async () => {
      try {
        setLoadingClosest(true);
        // Relax filter: try fetching by category alone or newest
        const fallbackParams = new URLSearchParams();
        if (category && category !== 'All') {
          fallbackParams.append('category', category);
        }
        fallbackParams.append('limit', '6');

        const fallbackRes = await api.get(`/jobs?${fallbackParams.toString()}`);
        if (fallbackRes.data.success && fallbackRes.data.jobs.length > 0) {
          setClosestMatches(fallbackRes.data.jobs);
        } else {
          // If category alone had 0, fetch general top jobs
          const allRes = await api.get('/jobs?limit=6&sort=newest');
          if (allRes.data.success) {
            setClosestMatches(allRes.data.jobs);
          }
        }
      } catch (e) {
        console.error('Failed to fetch fallback matches:', e);
      } finally {
        setLoadingClosest(false);
      }
    };

    fetchJobs();
  }, [search, location, category, jobType, experience, minSalary, sort, matchCriteria, page, user, isCandidate]);

  // Apply filters to searchParams
  const updateUrlParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: '1' };

    // Clean up empty or 'All'
    Object.keys(merged).forEach((key) => {
      if (!merged[key] || merged[key] === 'All' || merged[key] === 'all') {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search, location });
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('All');
    setJobType('All');
    setExperience('All');
    setMinSalary('');
    setSort('newest');
    setMatchCriteria('all');
    setSearchParams({});
  };

  // Identify active filter tags for quick removal
  const activeFilters = useMemo(() => {
    const list = [];
    if (search) list.push({ key: 'search', label: `Keyword: "${search}"`, reset: { search: '' } });
    if (location) list.push({ key: 'location', label: `Location: "${location}"`, reset: { location: '' } });
    if (category && category !== 'All') list.push({ key: 'category', label: `Category: ${category}`, reset: { category: 'All' } });
    if (jobType && jobType !== 'All') list.push({ key: 'jobType', label: `Type: ${jobType}`, reset: { jobType: 'All' } });
    if (experience && experience !== 'All') list.push({ key: 'experience', label: `Level: ${experience}`, reset: { experience: 'All' } });
    if (minSalary) list.push({ key: 'minSalary', label: `Min Salary: $${Number(minSalary).toLocaleString()}`, reset: { minSalary: '' } });
    if (matchCriteria && matchCriteria !== 'all') {
      const opt = matchCriteriaOptions.find((m) => m.value === matchCriteria);
      list.push({ key: 'match', label: `Match: ${opt?.label || matchCriteria}`, reset: { match: 'all' } });
    }
    return list;
  }, [search, location, category, jobType, experience, minSalary, matchCriteria]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">
              Explore All Job Opportunities
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Find full-time, part-time, and remote positions matching your skillset.
            </p>
          </div>

          {/* Job Match Criteria Pill Indicator for Candidates */}
          {isCandidate && user && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 border border-brand-200 text-brand-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <Target className="w-4 h-4 text-brand-600" />
              <span>
                Matching active for: <strong>{user.profile?.skills?.length || 0} skills</strong>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Title, skills, or company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="City, region, or Remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center"
              aria-label="Filter"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Active Filter Chips with instant remove buttons */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Active Criteria:</span>
            {activeFilters.map((af) => (
              <button
                key={af.key}
                type="button"
                onClick={() => updateUrlParams(af.reset)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                title={`Remove ${af.label}`}
              >
                <span>{af.label}</span>
                <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="text-brand-600 hover:text-brand-800 hover:underline font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-navy-900 text-base">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* JOB MATCH CRITERIA FILTER (Profile Match Scoring) */}
            {isCandidate && user && (
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider mb-2">
                  <Target className="w-4 h-4 text-brand-600" />
                  <span>Job Match Criteria</span>
                </div>
                <div className="space-y-1.5">
                  {matchCriteriaOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-brand-700 font-medium"
                    >
                      <input
                        type="radio"
                        name="matchCriteria"
                        checked={matchCriteria === opt.value}
                        onChange={() => {
                          setMatchCriteria(opt.value);
                          updateUrlParams({ match: opt.value });
                        }}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Category
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      updateUrlParams({ category: cat });
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Job Type
              </label>
              <div className="space-y-1.5">
                {jobTypesList.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-navy-900">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobType === type}
                      onChange={() => {
                        setJobType(type);
                        updateUrlParams({ jobType: type });
                      }}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Experience Level
              </label>
              <div className="space-y-1.5">
                {experienceList.map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-navy-900">
                    <input
                      type="radio"
                      name="experience"
                      checked={experience === exp}
                      onChange={() => {
                        setExperience(exp);
                        updateUrlParams({ experience: exp });
                      }}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Salary Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Min Yearly Salary (USD)
              </label>
              <select
                value={minSalary}
                onChange={(e) => {
                  setMinSalary(e.target.value);
                  updateUrlParams({ minSalary: e.target.value });
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">Any Salary</option>
                <option value="50000">$50,000+ / year</option>
                <option value="80000">$80,000+ / year</option>
                <option value="100000">$100,000+ / year</option>
                <option value="130000">$130,000+ / year</option>
                <option value="160000">$160,000+ / year</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Job Results Column */}
        <main className="lg:col-span-3 space-y-6">
          {/* Results Bar: Count & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-sm font-medium text-slate-600">
              Showing <strong className="text-navy-900">{jobs.length}</strong> of{' '}
              <strong className="text-navy-900">{totalJobs}</strong> jobs
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateUrlParams({ sort: e.target.value });
                }}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Newest First</option>
                {isCandidate && <option value="match">🎯 Highest Match to Profile</option>}
                <option value="salary_high">Highest Salary</option>
                <option value="salary_low">Lowest Salary</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Job Cards Grid */}
          {loading ? (
            <LoadingSpinner message="Searching verified job postings..." />
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            /* Enhanced Zero-Results State with Criteria Breakdown & Smart Fallback */
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3.5">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-1.5">No exact jobs match your criteria</h3>
                <p className="text-sm text-slate-500 max-w-lg mx-auto mb-4 leading-relaxed">
                  {activeFilters.length > 0 ? (
                    <>
                      Your current filter combination ({activeFilters.map((f) => f.label).join(', ')}) produced 0 results. Try removing one of the criteria below to see available openings.
                    </>
                  ) : (
                    'Try adjusting your search keywords or resetting your filter options.'
                  )}
                </p>

                {/* Quick Criteria Removal Chips */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    {activeFilters.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => updateUrlParams(f.reset)}
                        className="px-3 py-1.5 rounded-xl border border-brand-300 bg-brand-50 text-brand-700 font-semibold text-xs hover:bg-brand-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove {f.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>

              {/* Closest Matching Fallback Jobs */}
              {closestMatches.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Closest Match Recommendations:</strong> Here are available openings that closely match your industry or background:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {closestMatches.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && jobs.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  updateUrlParams({ page: newPage.toString() });
                }}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    updateUrlParams({ page: p.toString() });
                  }}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    page === p
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, page + 1);
                  setPage(newPage);
                  updateUrlParams({ page: newPage.toString() });
                }}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-navy-950/50 backdrop-blur-sm lg:hidden">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-bold text-navy-900 text-base">Filter Jobs</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {isCandidate && user && (
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
                  Match Criteria
                </label>
                <select
                  value={matchCriteria}
                  onChange={(e) => {
                    setMatchCriteria(e.target.value);
                    updateUrlParams({ match: e.target.value });
                  }}
                  className="w-full text-sm p-2 rounded-lg border border-brand-300 bg-brand-50"
                >
                  {matchCriteriaOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  updateUrlParams({ category: e.target.value });
                }}
                className="w-full text-sm p-2 rounded-lg border border-slate-300"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => {
                  setJobType(e.target.value);
                  updateUrlParams({ jobType: e.target.value });
                }}
                className="w-full text-sm p-2 rounded-lg border border-slate-300"
              >
                {jobTypesList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience</label>
              <select
                value={experience}
                onChange={(e) => {
                  setExperience(e.target.value);
                  updateUrlParams({ experience: e.target.value });
                }}
                className="w-full text-sm p-2 rounded-lg border border-slate-300"
              >
                {experienceList.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t flex gap-2">
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2 rounded-lg border text-sm text-slate-700 font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
