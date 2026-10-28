import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, AlertCircle, FileText, Globe, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ApplyModal = ({ job, isOpen, onClose, onAppliedSuccess }) => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(
    !!user?.profile?.resumeOriginalName
  );
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.profile?.portfolioUrl || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowed.includes(ext)) {
      setError('Invalid file type. Please upload a PDF or DOC/DOCX document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum allowed resume size is 5MB.');
      return;
    }

    setError(null);
    setResumeFile(file);
    setUseProfileResume(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!useProfileResume && !resumeFile) {
      setError('Please upload a resume or select your profile resume.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('portfolioUrl', portfolioUrl);

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccess(true);
        if (onAppliedSuccess) onAppliedSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-2">Application Submitted!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received by the hiring team. A confirmation has been sent to your email.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/candidate/dashboard?tab=applications"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors text-sm shadow-sm"
              >
                View In Dashboard
              </Link>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Job Application
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-0.5">
                Apply for {job.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {job.company} &bull; {job.location}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Resume Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Resume / CV <span className="text-rose-500">*</span>
                </label>

                {user?.profile?.resumeOriginalName && (
                  <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 text-sm text-slate-700">
                      <FileText className="w-5 h-5 text-brand-600" />
                      <div>
                        <p className="font-medium">{user.profile.resumeOriginalName}</p>
                        <p className="text-xs text-slate-400">Saved profile resume</p>
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 text-xs font-medium text-brand-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useProfileResume}
                        onChange={(e) => {
                          setUseProfileResume(e.target.checked);
                          if (e.target.checked) setResumeFile(null);
                        }}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>Use this resume</span>
                    </label>
                  </div>
                )}

                {(!useProfileResume || !user?.profile?.resumeOriginalName) && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-brand-500 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <UploadCloud className="w-8 h-8 text-brand-600 mb-2" />
                      <span className="text-sm font-semibold text-brand-700 hover:underline">
                        {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Portfolio / Website URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Portfolio or GitHub URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com or https://github.com/username"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Cover Letter / Note to Employer <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explain why you are a great fit for this position and mention relevant achievements..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
