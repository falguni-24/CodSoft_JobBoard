import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Mail, MapPin, Phone, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Job<span className="text-brand-400">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              JobConnect bridges top tech talent with industry-leading employers. Discover career-defining opportunities and hire the brightest minds worldwide.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-slate-400">
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Job Seekers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/jobs" className="hover:text-brand-400 transition-colors">
                  Browse All Jobs
                </Link>
              </li>
              <li>
                <Link to="/jobs?category=Software+Development" className="hover:text-brand-400 transition-colors">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/jobs?jobType=Remote" className="hover:text-brand-400 transition-colors">
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link to="/candidate/dashboard" className="hover:text-brand-400 transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/employer/dashboard?tab=post-job" className="hover:text-brand-400 transition-colors">
                  Post a Job Listing
                </Link>
              </li>
              <li>
                <Link to="/employer/dashboard" className="hover:text-brand-400 transition-colors">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-brand-400 transition-colors">
                  Company Directory
                </Link>
              </li>
              <li>
                <Link to="/register?role=employer" className="hover:text-brand-400 transition-colors">
                  Employer Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support & Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@jobconnect.demo</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (800) 555-JOBS</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} JobConnect. All rights reserved.</p>
          <p className="flex items-center">
            Built with modern React, Express & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
