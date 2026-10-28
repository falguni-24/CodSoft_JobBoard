import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  Building,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  Edit,
  ExternalLink,
  AlertCircle,
  FileText,
  DollarSign,
  MapPin,
  Loader2,
  Eye,
  Check,
  XCircle,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculateJobMatch } from '../utils/matchCriteria';

const categories = [
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

const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Remote', 'Internship'];
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal', 'Executive'];

const EmployerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Stats & Listings State
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Posting / Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: user?.profile?.companyName || user?.name || '',
    location: '',
    category: 'Software Development',
    jobType: 'Full-Time',
    experience: 'Mid Level',
    minSalary: '',
    maxSalary: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    skills: '',
    status: 'active',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  // Applicants State
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Employer Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    companyName: user?.profile?.companyName || '',
    companyWebsite: user?.profile?.companyWebsite || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Load stats and jobs
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/jobs/employer/stats'),
        api.get('/jobs/employer/my-jobs'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle edit param in URL
  useEffect(() => {
    const editId = searchParams.get('jobId');
    if (activeTab === 'edit' && editId) {
      const targetJob = jobs.find((j) => j._id === editId);
      if (targetJob) {
        setIsEditing(true);
        setEditJobId(targetJob._id);
        setJobForm({
          title: targetJob.title,
          company: targetJob.company,
          location: targetJob.location,
          category: targetJob.category,
          jobType: targetJob.jobType,
          experience: targetJob.experience,
          minSalary: targetJob.salaryRange?.min || '',
          maxSalary: targetJob.salaryRange?.max || '',
          description: targetJob.description,
          responsibilities: (targetJob.responsibilities || []).join('\n'),
          qualifications: (targetJob.qualifications || []).join('\n'),
          skills: (targetJob.skills || []).join(', '),
          status: targetJob.status,
        });
      }
    } else if (activeTab === 'post-job') {
      setIsEditing(false);
      setEditJobId(null);
      setJobForm({
        title: '',
        company: user?.profile?.companyName || user?.name || '',
        location: '',
        category: 'Software Development',
        jobType: 'Full-Time',
        experience: 'Mid Level',
        minSalary: '',
        maxSalary: '',
        description: '',
        responsibilities: '',
        qualifications: '',
        skills: '',
        status: 'active',
      });
    }
  }, [activeTab, searchParams, jobs, user]);

  const setTab = (tab) => {
    setSearchParams({ tab });
    setFormMessage(null);
  };

  // Job Form Submit (Create or Update)
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMessage(null);

    const payload = {
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      category: jobForm.category,
      jobType: jobForm.jobType,
      experience: jobForm.experience,
      salaryRange: {
        min: jobForm.minSalary ? Number(jobForm.minSalary) : 0,
        max: jobForm.maxSalary ? Number(jobForm.maxSalary) : 0,
        currency: 'USD',
        period: 'yearly',
      },
      description: jobForm.description,
      responsibilities: jobForm.responsibilities,
      qualifications: jobForm.qualifications,
      skills: jobForm.skills,
      status: jobForm.status,
    };

    try {
      if (isEditing && editJobId) {
        const res = await api.put(`/jobs/${editJobId}`, payload);
        if (res.data.success) {
          setFormMessage({ type: 'success', text: 'Job updated successfully!' });
          await loadDashboardData();
          setTimeout(() => setTab('jobs'), 1500);
        }
      } else {
        const res = await api.post('/jobs', payload);
        if (res.data.success) {
          setFormMessage({ type: 'success', text: 'Job listing posted successfully!' });
          await loadDashboardData();
          setTimeout(() => setTab('jobs'), 1500);
        }
      }
    } catch (err) {
      setFormMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save job listing.',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing and all its applications?')) {
      return;
    }
    try {
      await api.delete(`/jobs/${jobId}`);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    }
  };

  // Toggle Active/Inactive Job Status
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  // Fetch Applicants for a Job
  const handleViewApplicants = async (job) => {
    setSelectedJobForApplicants(job);
    setTab('applicants');
    try {
      setLoadingApplicants(true);
      const res = await api.get(`/jobs/${job._id}/applications`);
      if (res.data.success) {
        setApplicants(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Update Applicant Status
  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    let note = '';
    if (newStatus === 'Shortlisted' || newStatus === 'Rejected' || newStatus === 'Reviewed') {
      const inputNote = window.prompt(
        `Optional: Add an interview note or feedback message for the candidate (${newStatus}):`
      );
      if (inputNote !== null) {
        note = inputNote.trim();
      }
    }
    try {
      setStatusUpdatingId(appId);
      const res = await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        statusNotes: note,
      });
      if (res.data.success) {
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: newStatus, statusNotes: note || app.statusNotes } : app
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Download Resume
  const handleDownloadResume = (appId) => {
    const token = localStorage.getItem('token');
    const url = `${api.defaults.baseURL}/applications/${appId}/resume`;
    // Fetch with auth header
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Resume file not accessible');
        return res.blob();
      })
      .then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = 'candidate-resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  // Update Employer Profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSubmitting(true);
      setProfileMessage(null);
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMessage({ type: 'success', text: 'Employer profile updated!' });
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Employer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 mt-1">
            {user?.profile?.companyName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your company job postings, review applicants, and source top talent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab('post-job')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Job</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setTab('overview')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>
        <button
          onClick={() => setTab('jobs')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Manage Jobs ({jobs.length})</span>
        </button>
        <button
          onClick={() => setTab('post-job')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'post-job' || activeTab === 'edit'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isEditing ? 'Edit Job' : 'Post New Job'}</span>
        </button>
        <button
          onClick={() => setTab('applicants')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'applicants'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Review Applicants</span>
        </button>
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company Profile</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Listings
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy-900">{stats?.activeJobs ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1">out of {stats?.totalJobs ?? 0} total postings</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Applicants
                </span>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy-900">{stats?.totalApplicants ?? 0}</div>
              <div className="text-xs text-slate-500 mt-1">across all posted jobs</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recent Activity
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-navy-900">
                {stats?.recentApplications?.length ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">applications received recently</div>
            </div>
          </div>

          {/* Recent Applications Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Recent Job Applications</span>
            </h2>

            {stats?.recentApplications && stats.recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recentApplications.map((app) => (
                  <div key={app._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{app.candidateId?.name}</h4>
                      <p className="text-xs text-slate-500">
                        Applied for <strong className="text-slate-800">{app.jobId?.title}</strong> &bull;{' '}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        app.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => {
                          const targetJob = jobs.find((j) => j._id === app.jobId?._id);
                          if (targetJob) handleViewApplicants(targetJob);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">
                No recent applications received yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Manage Jobs */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">Your Posted Jobs</h2>
            <button
              onClick={() => setTab('post-job')}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Job</span>
            </button>
          </div>

          {jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Job Title</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Applicants</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-3">
                        <Link to={`/jobs/${job._id}`} className="font-semibold text-navy-900 hover:text-brand-600">
                          {job.title}
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5">{job.location} &bull; {job.jobType}</div>
                      </td>
                      <td className="py-4 px-3 text-xs text-slate-600 font-medium">
                        {job.category}
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{job.applicantCount || 0} applicants</span>
                        </button>
                      </td>
                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            job.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                          title="Click to toggle active/inactive"
                        >
                          {job.status}
                        </button>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSearchParams({ tab: 'edit', jobId: job._id });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="Edit Job"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">You have not posted any job listings yet.</p>
              <button
                onClick={() => setTab('post-job')}
                className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm"
              >
                Post Your First Job
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Post / Edit Job Form */}
      {(activeTab === 'post-job' || activeTab === 'edit') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-navy-900">
              {isEditing ? 'Edit Job Listing' : 'Create a New Job Listing'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide thorough details to attract qualified candidates.
            </p>
          </div>

          {formMessage && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                formMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {formMessage.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{formMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleJobSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack React Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jobForm.category}
                  onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jobForm.jobType}
                  onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {jobTypes.map((jt) => (
                    <option key={jt} value={jt}>{jt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Experience Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={jobForm.experience}
                  onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote, or New York, NY"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Min Salary ($ / yr)
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={jobForm.minSalary}
                  onChange={(e) => setJobForm({ ...jobForm, minSalary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Salary ($ / yr)
                </label>
                <input
                  type="number"
                  placeholder="140000"
                  value={jobForm.maxSalary}
                  onChange={(e) => setJobForm({ ...jobForm, maxSalary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, TypeScript, MongoDB, Docker"
                value={jobForm.skills}
                onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Overview / Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                placeholder="Describe the company mission and overview of the role..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Key Responsibilities (One per line)
              </label>
              <textarea
                rows={3}
                value={jobForm.responsibilities}
                onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                placeholder="Architect and maintain web features&#10;Conduct code reviews and mentor teammates"
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Qualifications & Requirements (One per line)
              </label>
              <textarea
                rows={3}
                value={jobForm.qualifications}
                onChange={(e) => setJobForm({ ...jobForm, qualifications: e.target.value })}
                placeholder="3+ years professional experience with React&#10;Proficiency with RESTful APIs and Node.js"
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTab('jobs')}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60 flex items-center gap-2"
              >
                {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isEditing ? 'Save Changes' : 'Publish Job Listing'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Review Applicants */}
      {activeTab === 'applicants' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Applicant Tracking Pipeline</h2>
              {selectedJobForApplicants && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing applicants for: <strong className="text-slate-800">{selectedJobForApplicants.title}</strong>
                </p>
              )}
            </div>

            {/* Job selector dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filter by job:</span>
              <select
                value={selectedJobForApplicants?._id || ''}
                onChange={(e) => {
                  const targetJob = jobs.find((j) => j._id === e.target.value);
                  if (targetJob) handleViewApplicants(targetJob);
                }}
                className="p-2 border border-slate-300 rounded-xl bg-white text-slate-800 font-medium focus:outline-none"
              >
                <option value="">Select a job...</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.applicantCount || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingApplicants ? (
            <LoadingSpinner message="Fetching applicants..." />
          ) : applicants.length > 0 ? (
            <div className="space-y-4">
              {applicants.map((app) => {
                const appMatch = calculateJobMatch(app.candidateId, selectedJobForApplicants || app.jobId);
                return (
                <div
                  key={app._id}
                  className="p-5 border border-slate-200 rounded-xl hover:border-brand-400 transition-all bg-slate-50/40 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-navy-900 text-base">{app.candidateId?.name}</h3>
                        {appMatch.score !== null && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            appMatch.score >= 75 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            appMatch.score >= 50 ? 'bg-sky-50 text-sky-800 border-sky-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            <Target className="w-3 h-3" />
                            <span>{appMatch.score}% Match</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5 mt-0.5">
                        <p>{app.candidateId?.email}</p>
                        {app.candidateId?.profile?.headline && (
                          <p className="text-slate-700 font-medium">{app.candidateId.profile.headline}</p>
                        )}
                      </div>

                      {/* Matched skills pill row */}
                      {appMatch.criteria?.skills?.matched?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] font-semibold text-slate-500">Matched Skills:</span>
                          {appMatch.criteria.skills.matched.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <select
                        value={app.status}
                        disabled={statusUpdatingId === app._id}
                        onChange={(e) => handleUpdateApplicantStatus(app._id, e.target.value)}
                        className={`text-xs font-semibold p-1.5 rounded-lg border focus:outline-none ${
                          app.status === 'Shortlisted' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                          app.status === 'Rejected' ? 'border-rose-300 bg-rose-50 text-rose-800' :
                          app.status === 'Reviewed' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                          'border-amber-300 bg-amber-50 text-amber-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <div className="text-xs text-slate-600 bg-white p-3.5 rounded-lg border border-slate-200 whitespace-pre-line">
                      <span className="font-semibold block text-slate-800 mb-1">Cover Note:</span>
                      {app.coverLetter}
                    </div>
                  )}

                  {/* Actions & Resume */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      {app.portfolioUrl && (
                        <a
                          href={app.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Portfolio Link</span>
                        </a>
                      )}
                      <span className="text-slate-400">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadResume(app._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resume ({app.resumeOriginalName})</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900">No applicants to display</h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedJobForApplicants
                  ? 'No candidates have applied to this specific job yet.'
                  : 'Select a job above to view its applicant pipeline.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Company Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-navy-900">Company Profile</h2>
            <p className="text-xs text-slate-500 mt-1">
              This information is displayed publicly on your job cards and employer page.
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Person Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Brand Name
              </label>
              <input
                type="text"
                value={profileForm.companyName}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Website
              </label>
              <input
                type="url"
                placeholder="https://company.example.com"
                value={profileForm.companyWebsite}
                onChange={(e) => setProfileForm({ ...profileForm, companyWebsite: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Headquarters
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Overview & Bio
              </label>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Briefly describe what your organization does and why people love working there..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {profileSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
