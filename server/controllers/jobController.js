const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs with filtering, search, sorting, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      category,
      jobType,
      experience,
      location,
      minSalary,
      maxSalary,
      sort,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by active status by default for public browsing
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    // Keyword search across title, company, description, or skills
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: searchRegex },
        { location: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    // Job type filter
    if (jobType && jobType !== 'All' && jobType !== 'all') {
      query.jobType = jobType;
    }

    // Experience filter
    if (experience && experience !== 'All' && experience !== 'all') {
      query.experience = experience;
    }

    // Location filter
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Salary filter
    if (minSalary) {
      query['salaryRange.max'] = { $gte: Number(minSalary) };
    }
    if (maxSalary) {
      query['salaryRange.min'] = { $lte: Number(maxSalary) };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // newest by default
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'salary_high') {
      sortOption = { 'salaryRange.max': -1 };
    } else if (sort === 'salary_low') {
      sortOption = { 'salaryRange.min': 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employerId', 'name email profile.companyName profile.companyWebsite')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employerId',
      'name email profile.companyName profile.companyWebsite profile.bio'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      description,
      responsibilities,
      qualifications,
      location,
      category,
      jobType,
      salaryRange,
      experience,
      skills,
      status,
    } = req.body;

    const job = await Job.create({
      title,
      company: company || req.user.profile?.companyName || req.user.name,
      description,
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : (responsibilities || '').split('\n').map((s) => s.trim()).filter(Boolean),
      qualifications: Array.isArray(qualifications)
        ? qualifications
        : (qualifications || '').split('\n').map((s) => s.trim()).filter(Boolean),
      location,
      category,
      jobType,
      salaryRange: {
        min: salaryRange?.min ? Number(salaryRange.min) : 0,
        max: salaryRange?.max ? Number(salaryRange.max) : 0,
        currency: salaryRange?.currency || 'USD',
        period: salaryRange?.period || 'yearly',
      },
      experience,
      skills: Array.isArray(skills)
        ? skills
        : (skills || '').split(',').map((s) => s.trim()).filter(Boolean),
      employerId: req.user._id,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Job listing posted successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing job posting
// @route   PUT /api/jobs/:id
// @access  Private (Owner Employer only)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    // Authorization check: Make sure user is the employer who posted the job
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only edit jobs created by your account',
      });
    }

    const {
      title,
      company,
      description,
      responsibilities,
      qualifications,
      location,
      category,
      jobType,
      salaryRange,
      experience,
      skills,
      status,
    } = req.body;

    if (title) job.title = title;
    if (company) job.company = company;
    if (description) job.description = description;
    if (responsibilities !== undefined) {
      job.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : responsibilities.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (qualifications !== undefined) {
      job.qualifications = Array.isArray(qualifications)
        ? qualifications
        : qualifications.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (location) job.location = location;
    if (category) job.category = category;
    if (jobType) job.jobType = jobType;
    if (salaryRange) {
      job.salaryRange = {
        min: salaryRange.min !== undefined ? Number(salaryRange.min) : job.salaryRange.min,
        max: salaryRange.max !== undefined ? Number(salaryRange.max) : job.salaryRange.max,
        currency: salaryRange.currency || job.salaryRange.currency || 'USD',
        period: salaryRange.period || job.salaryRange.period || 'yearly',
      };
    }
    if (experience) job.experience = experience;
    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (status) job.status = status;

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Owner Employer only)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found',
      });
    }

    // Owner check
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job listing',
      });
    }

    await job.deleteOne();

    // Clean up associated applications
    await Application.deleteMany({ jobId: job._id });

    res.status(200).json({
      success: true,
      message: 'Job listing and associated applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by the logged-in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
exports.getEmployerJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 });

    // Aggregate applicant counts for each job
    const jobIds = jobs.map((j) => j._id);
    const applicationCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    applicationCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const jobsWithCounts = jobs.map((job) => {
      const plain = job.toObject();
      plain.applicantCount = countMap[job._id.toString()] || 0;
      return plain;
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for employer
// @route   GET /api/jobs/employer/stats
// @access  Private (Employer only)
exports.getEmployerStats = async (req, res, next) => {
  try {
    const employerJobs = await Job.find({ employerId: req.user._id });
    const jobIds = employerJobs.map((j) => j._id);

    const activeJobsCount = employerJobs.filter((j) => j.status === 'active').length;
    const totalJobsCount = employerJobs.length;

    const totalApplicantsCount = await Application.countDocuments({
      jobId: { $in: jobIds },
    });

    const recentApplications = await Application.find({
      jobId: { $in: jobIds },
    })
      .populate('candidateId', 'name email profile.headline profile.location')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        activeJobs: activeJobsCount,
        totalJobs: totalJobsCount,
        totalApplicants: totalApplicantsCount,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};
