import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Globe, ArrowRight, Search } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await api.get('/jobs?limit=50');
        if (res.data.success) {
          // Group jobs by company name
          const companyMap = {};
          res.data.jobs.forEach((job) => {
            const name = job.company;
            if (!companyMap[name]) {
              companyMap[name] = {
                name,
                location: job.location,
                category: job.category,
                website: job.employerId?.profile?.companyWebsite || '',
                bio: job.employerId?.profile?.bio || 'Leading technology and industry innovator.',
                jobCount: 0,
                jobs: [],
              };
            }
            companyMap[name].jobCount += 1;
            companyMap[name].jobs.push(job);
          });

          setCompanies(Object.values(companyMap));
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1 mb-2">
          Featured Hiring Companies
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mb-6">
          Explore organizations currently recruiting on JobConnect. Browse their active openings and workplace culture.
        </p>

        {/* Search */}
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by company name, location, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSpinner message="Loading company directory..." />
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.name}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold text-xl shrink-0">
                    {company.name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Briefcase className="w-3 h-3" />
                    {company.jobCount} open {company.jobCount === 1 ? 'role' : 'roles'}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-navy-900 mb-1">{company.name}</h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.location}</span>
                  <span>&bull;</span>
                  <span className="text-brand-600 font-medium">{company.category}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {company.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-500 hover:text-brand-600"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                ) : (
                  <span />
                )}

                <Link
                  to={`/jobs?search=${encodeURIComponent(company.name)}`}
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                >
                  <span>View Open Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-navy-900 mb-1">No companies found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
