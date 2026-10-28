import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  FileText,
  Bookmark,
  Send,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  Building,
  MapPin,
  Briefcase,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Target,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculateJobMatch } from '../utils/matchCriteria';

const CandidateDashboard = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'applications';

  // Applications & Saved Jobs State
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);

  // Resume Upload State
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.profile?.headline || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    portfolioUrl: user?.profile?.portfolioUrl || '',
    skills: (user?.profile?.skills || []).join(', '),
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Experience & Education Lists
  const [experiences, setExperiences] = useState(user?.profile?.experience || []);
  const [educations, setEducations] = useState(user?.profile?.education || []);

  // Modals / Inline form states
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExp, setNewExp] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [expSaving, setExpSaving] = useState(false);

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    graduationYear: '',
  });
  const [eduSaving, setEduSaving] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setExperiences(user.profile.experience || []);
      setEducations(user.profile.education || []);
      setProfileForm({
        name: user.name || '',
        headline: user.profile.headline || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
        location: user.profile.location || '',
        portfolioUrl: user.profile.portfolioUrl || '',
        skills: (user.profile.skills || []).join(', '),
      });
    }
  }, [user]);

  // Load candidate applications, saved jobs, and recommendations
  const loadCandidateData = async () => {
    try {
      setLoading(true);
      const [appRes, savedRes, jobsRes] = await Promise.all([
        api.get('/applications/my'),
        api.get('/saved-jobs'),
        api.get('/jobs?limit=6&sort=newest'),
      ]);

      if (appRes.data.success) {
        setApplications(appRes.data.applications);
      }
      if (savedRes.data.success) {
        setSavedJobs(savedRes.data.savedJobs);
      }
      if (jobsRes.data.success) {
        setRecommendations(jobsRes.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load candidate dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidateData();
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
    setProfileMessage(null);
    setResumeSuccess(null);
  };

  // Withdraw Application
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    try {
      const res = await api.patch(`/applications/${applicationId}/withdraw`);
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: 'Withdrawn' } : app
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    }
  };

  // Unsave Job
  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((item) => item.jobId?._id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  // Resume File Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      alert('Only PDF and DOC/DOCX files are supported.');
      return;
    }

    try {
      setResumeUploading(true);
      setResumeSuccess(null);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/auth/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResumeSuccess(`Uploaded ${res.data.resume.originalName} successfully!`);
        // Refresh current user in auth context
        const userRes = await api.get('/auth/me');
        if (userRes.data.success) {
          updateUser(userRes.data.user);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setResumeUploading(false);
    }
  };

  // Profile Form Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMessage(null);

      const res = await api.put('/auth/profile', {
        name: profileForm.name,
        headline: profileForm.headline,
        bio: profileForm.bio,
        phone: profileForm.phone,
        location: profileForm.location,
        portfolioUrl: profileForm.portfolioUrl,
        skills: profileForm.skills,
        experience: experiences,
        education: educations,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMessage({ type: 'success', text: 'Candidate profile updated successfully!' });
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Add Work Experience
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExp.title || !newExp.company) {
      alert('Job title and Company are required.');
      return;
    }
    try {
      setExpSaving(true);
      const updatedList = [...experiences, newExp];
      const res = await api.put('/auth/profile', { experience: updatedList });
      if (res.data.success) {
        setExperiences(updatedList);
        updateUser(res.data.user);
        setShowAddExp(false);
        setNewExp({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add experience.');
    } finally {
      setExpSaving(false);
    }
  };

  // Delete Work Experience
  const handleDeleteExperience = async (indexToDelete) => {
    try {
      const updatedList = experiences.filter((_, idx) => idx !== indexToDelete);
      const res = await api.put('/auth/profile', { experience: updatedList });
      if (res.data.success) {
        setExperiences(updatedList);
        updateUser(res.data.user);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove experience.');
    }
  };

  // Add Education
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!newEdu.degree || !newEdu.institution) {
      alert('Degree and Institution are required.');
      return;
    }
    try {
      setEduSaving(true);
      const updatedList = [...educations, newEdu];
      const res = await api.put('/auth/profile', { education: updatedList });
      if (res.data.success) {
        setEducations(updatedList);
        updateUser(res.data.user);
        setShowAddEdu(false);
        setNewEdu({
          degree: '',
          institution: '',
          fieldOfStudy: '',
          graduationYear: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add education.');
    } finally {
      setEduSaving(false);
    }
  };

  // Delete Education
  const handleDeleteEducation = async (indexToDelete) => {
    try {
      const updatedList = educations.filter((_, idx) => idx !== indexToDelete);
      const res = await api.put('/auth/profile', { education: updatedList });
      if (res.data.success) {
        setEducations(updatedList);
        updateUser(res.data.user);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove education.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
            {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.profile?.headline || 'Explore recommendations, track your applications, and update your matching profile.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
          >
            <Briefcase className="w-4 h-4" />
            <span>Search New Jobs</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setTab('applications')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setTab('saved')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Jobs ({savedJobs.length})</span>
        </button>

        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile, Experience & Education</span>
        </button>

        <button
          onClick={() => setTab('recommendations')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4 text-brand-600" />
          <span>Job Match Criteria & Recommendations</span>
        </button>
      </div>

      {/* Tab 1: Submitted Applications with Expandable Detail Card */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Submitted Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor status updates, employer review notes, and hiring feedback.
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your applications..." />
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => {
                const isWithdrawable = app.status === 'Pending' || app.status === 'Reviewed';
                const isExpanded = expandedAppId === app._id;
                return (
                  <div
                    key={app._id}
                    className="p-5 border border-slate-200 rounded-xl hover:border-brand-300 transition-all bg-slate-50/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-navy-900 text-base">
                            {app.jobId ? (
                              <Link to={`/jobs/${app.jobId._id}`} className="hover:text-brand-600">
                                {app.jobId.title}
                              </Link>
                            ) : (
                              'Position (No longer active)'
                            )}
                          </h3>
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                          <span className="font-medium text-slate-700">
                            {app.jobId?.company || 'Employer'}
                          </span>
                          <span>&bull;</span>
                          <span>{app.jobId?.location}</span>
                          <span>&bull;</span>
                          <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'Shortlisted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : app.status === 'Reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'Withdrawn'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1"
                          title="Toggle application details"
                        >
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isWithdrawable && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="px-3 py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 text-xs font-medium transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Employer Feedback Note */}
                    {app.statusNotes && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-navy-900 block mb-0.5">Employer Feedback Note:</strong>
                        <span>{app.statusNotes}</span>
                      </div>
                    )}

                    {/* Expandable Application Materials Drawer */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200/80 space-y-3 text-xs bg-white p-4 rounded-xl border">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-700">
                            <FileText className="w-4 h-4 text-brand-600" />
                            <span>Submitted Resume: <strong>{app.resumeOriginalName || 'Resume.pdf'}</strong></span>
                          </div>

                          {app.portfolioUrl && (
                            <a
                              href={app.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Submitted Portfolio</span>
                            </a>
                          )}
                        </div>

                        {app.coverLetter && (
                          <div>
                            <span className="font-bold text-slate-700 block mb-1">Cover Note:</span>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No applications yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 mt-1">
                Explore thousands of verified job postings and submit your application with a single click.
              </p>
              <Link
                to="/jobs"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700"
              >
                Browse Job Listings
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Jobs */}
      {activeTab === 'saved' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-navy-900">Your Bookmarked Jobs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and apply to positions you've saved for later.
            </p>
          </div>

          {savedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedJobs.map((item) => (
                <div key={item._id} className="relative group">
                  <JobCard
                    job={item.jobId}
                    isSavedInitial={true}
                    onSaveToggle={(jobId, isSaved) => {
                      if (!isSaved) handleUnsave(jobId);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No saved jobs</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 mt-1">
                When you see an interesting role while browsing, click the bookmark icon to save it here.
              </p>
              <Link
                to="/jobs"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700"
              >
                Find Jobs to Save
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile, Experience & Education */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Upload Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Default Resume</span>
              </h3>
              <p className="text-xs text-slate-500">
                Upload your latest resume so you can apply to jobs with 1-click.
              </p>

              {user?.profile?.resumeOriginalName ? (
                <div className="p-3.5 bg-brand-50 border border-brand-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-brand-900 text-xs font-semibold">
                    <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="truncate">{user.profile.resumeOriginalName}</span>
                  </div>
                  <p className="text-[11px] text-brand-700">
                    Uploaded: {new Date(user.profile.resumeUpdatedAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  No default resume uploaded yet.
                </div>
              )}

              {resumeSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{resumeSuccess}</span>
                </div>
              )}

              <div className="pt-2">
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file"
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {resumeUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-brand-600" />
                      <span>{user?.profile?.resumeOriginalName ? 'Replace Resume' : 'Upload Resume (PDF/DOC)'}</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Match Criteria Profile Health Tip */}
            <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-5 text-xs text-brand-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-brand-800">
                <Target className="w-4 h-4 text-brand-600" />
                <span>Job Match Precision</span>
              </div>
              <p className="text-brand-700 leading-relaxed">
                Adding your specific skills, work experience, and degree directly boosts your automated Match Score on job listings and helps hiring managers find you faster.
              </p>
            </div>
          </div>

          {/* Profile Form, Experience & Education Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Basic Profile Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-bold text-navy-900 text-lg">Candidate Profile Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keep your headline, skills, and contact details up to date.
                </p>
              </div>

              {profileMessage && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Austin, TX or Remote"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Portfolio / GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={profileForm.portfolioUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Key Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Node.js, JavaScript, MongoDB, CSS, Git, Docker"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bio / Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short summary of your career background and interests..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Interactive Work Experience Manager */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-600" />
                    <span>Work Experience</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add previous employment history to strengthen experience match criteria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExp(!showAddExp)}
                  className="px-3.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-brand-200/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {/* Add Experience Form */}
              {showAddExp && (
                <form onSubmit={handleAddExperience} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">New Experience Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Job Title (e.g. Senior Frontend Developer)"
                      value={newExp.title}
                      onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Company Name (e.g. Acme Tech)"
                      value={newExp.company}
                      onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Location (e.g. Austin, TX / Remote)"
                      value={newExp.location}
                      onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Start (e.g. 2021-03)"
                      value={newExp.startDate}
                      onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="End (or Present)"
                      value={newExp.endDate}
                      onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Key achievements and technologies used..."
                    value={newExp.description}
                    onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={expSaving}
                      className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                    >
                      {expSaving ? 'Saving...' : 'Add Experience'}
                    </button>
                  </div>
                </form>
              )}

              {/* Experiences List */}
              {experiences.length > 0 ? (
                <div className="space-y-3">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm">{exp.title}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {exp.company} &bull; {exp.location || 'Remote'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {exp.startDate || 'Started'} — {exp.endDate || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteExperience(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No work experience entries added yet. Click "+ Add Experience" above to list your roles.
                </p>
              )}
            </div>

            {/* 3. Interactive Education Manager */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-brand-600" />
                    <span>Education & Degrees</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    List academic credentials, degrees, and universities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEdu(!showAddEdu)}
                  className="px-3.5 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-brand-200/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>

              {/* Add Education Form */}
              {showAddEdu && (
                <form onSubmit={handleAddEducation} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">New Education Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Degree (e.g. B.S. in Computer Science)"
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Institution (e.g. University of Texas)"
                      value={newEdu.institution}
                      onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Software Engineering)"
                      value={newEdu.fieldOfStudy}
                      onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year (e.g. 2022)"
                      value={newEdu.graduationYear}
                      onChange={(e) => setNewEdu({ ...newEdu, graduationYear: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEdu(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={eduSaving}
                      className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                    >
                      {eduSaving ? 'Saving...' : 'Add Education'}
                    </button>
                  </div>
                </form>
              )}

              {/* Education List */}
              {educations.length > 0 ? (
                <div className="space-y-3">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm">{edu.degree}</h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {edu.institution} {edu.fieldOfStudy ? `&bull; ${edu.fieldOfStudy}` : ''}
                        </p>
                        {edu.graduationYear && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Class of {edu.graduationYear}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEducation(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No education entries added yet. Click "+ Add Education" above to list your degrees.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Match Criteria & Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-600" />
                <span>Job Match Criteria & Recommendations</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Jobs scored and ranked by skill overlap ({user?.profile?.skills?.length || 0} skills), experience, and location alignment.
              </p>
            </div>
            <Link
              to="/jobs?sort=match"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Matched Jobs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Profile Match Criteria Summary Bar */}
          <div className="p-4 bg-brand-50/60 rounded-xl border border-brand-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-brand-900">
                Your Active Criteria Profile: <strong>{user?.profile?.headline || 'Candidate'}</strong> &bull; Location: <strong>{user?.profile?.location || 'Any'}</strong> &bull; Work History: <strong>{experiences.length} roles</strong> &bull; Education: <strong>{educations.length} degrees</strong>
              </span>
            </div>
            <Link
              to="/candidate/dashboard?tab=profile"
              className="font-bold text-brand-700 hover:underline"
            >
              Update Match Skills
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...recommendations]
              .sort(
                (a, b) =>
                  (calculateJobMatch(user, b).score || 0) -
                  (calculateJobMatch(user, a).score || 0)
              )
              .map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
